// The module of `user` on the node's database (IndexedDB, SQLite) (USR-1, WEB-8, WEB-9; part 21.2): the
// oracle's (TST-2, `memory/src/oracle/user.ts`) over the node's database.
// Each office is its own store, by its path: the activities she asked
// (`['state', 'activity', activity_id]`), her drafts (`['state', 'draft',
// draft_id]`), her active face (`['state', 'active_face']`, one record with
// no id). Its predicates read the keys they name in their office's store,
// its facts' writes put in it only, and its reads read by range and select
// in memory, as the oracle does: each office's ports over its own store.
import * as zz from '@q-mino/domains/library';
import { registry as activities_registry } from '@q-mino/domains/user/activities/_registry.ts';
import { registry as drafts_registry } from '@q-mino/domains/user/drafts/_registry.ts';
import { registry as choices_registry } from '@q-mino/domains/user/choices/_registry.ts';
import { activity_card } from '@q-mino/domains/user/activities/_value.ts';
import { a_draft } from '@q-mino/domains/user/drafts/_value.ts';
import { the_active_face } from '@q-mino/domains/user/choices/_value.ts';
import { the_activity_is_in_progress } from '@q-mino/domains/user/activities/_dsl.ts';
import { an_activity, ask_for_an_activity, end_an_activity, the_activities_in_progress, } from '@q-mino/domains/user/activities/_usecase.ts';
import { a_draft as a_draft_use_case, drop_a_draft, keep_a_draft, } from '@q-mino/domains/user/drafts/_usecase.ts';
import { change_face, the_active_face as the_active_face_use_case, } from '@q-mino/domains/user/choices/_usecase.ts';
import { execute_in, recorded_in, the_operators } from "../command.js";
import { after, reads_in, selection_operators, } from "../reads.js";
import { deleted, every_parsed, on_a_record, parsed, set, the_records_of_a_domain, } from "../records.js";
/** The offices' paths: each its own store (WEB-8). */
const activities_path = 'user/activities';
const drafts_path = 'user/drafts';
const choices_path = 'user/choices';
/** The records of the activities: an activity's card, by its id. */
const the_activities_records = the_records_of_a_domain(activities_path);
const an_activity_s = (id) => the_activities_records.a('activity', id);
const every_activity = the_activities_records.every('activity');
/** The records of the drafts: a draft, by its id. */
const the_drafts_records = the_records_of_a_domain(drafts_path);
const a_draft_s = (id) => the_drafts_records.a('draft', id);
const every_draft = the_drafts_records.every('draft');
/** The record of the choices: her active face, one record with no id. */
const the_active_face_s = the_records_of_a_domain(choices_path).a('active_face');
/** A fact that changes nothing (DOM-6): it reads and puts nothing. */
const nothing = () => ({ reads: [], puts: () => [] });
// The activities (USR-2..USR-4).
const activities_fragments = {
    'user/activities/predicate/an_activity_has_this_id': (p) => on_a_record(activity_card)(an_activity_s(p.activity_id), (card) => card !== undefined),
    'user/activities/predicate/the_activity_is_in_progress': (p) => on_a_record(activity_card)(an_activity_s(p.activity_id), (card) => card !== undefined && the_activity_is_in_progress(card)),
};
const activity_selection = {
    ...selection_operators(),
    predicate: {
        'user/activities/selection/activity/the_activity_has_this_id': (p) => () => (card) => card.activity_id === p.activity_id,
        'user/activities/selection/activity/the_activity_is_in_progress': () => () => (card) => the_activity_is_in_progress(card),
    },
};
const the_activities = {
    reads: [every_activity],
    candidates: (records) => every_parsed(activity_card)(records, every_activity),
};
const as_a_card = {
    activity_id: () => (card) => card.activity_id,
    what: () => (card) => card.what,
    asked_at: () => (card) => card.asked_at,
    stage: () => (card) => card.stage,
};
const activity_sources = {
    an_activity: { from: the_activities, fields: as_a_card },
    the_activities_in_progress: { from: the_activities, fields: as_a_card },
};
/**
 * An activity after its end, parsed as an activity of the office, so that a
 * fact that leaves one in no stage of the domain's fails where it is written
 * (the oracle's interpreter rule, `extensions.ts`).
 */
const activities_writes = {
    'user/activities/fact/an_activity_has_been_asked': ({ activity }) => ({
        reads: [],
        puts: () => [
            set(an_activity_s(activity.activity_id), activity_card.parse({ ...activity, stage: { stage: 'in_progress' } })),
        ],
    }),
    'user/activities/fact/an_activity_has_been_asked_again': nothing,
    'user/activities/fact/an_activity_has_ended': ({ activity_id: id, how_it_ended, at }) => {
        const key = an_activity_s(id);
        return {
            reads: [key],
            puts: (records) => {
                const before = parsed(activity_card)(records.of(key));
                return before === undefined
                    ? []
                    : [
                        set(key, activity_card.parse({
                            ...before,
                            stage: { stage: 'ended', how_it_ended, ended_at: at },
                        })),
                    ];
            },
        };
    },
};
// The drafts (USR-5).
const drafts_fragments = {
    'user/drafts/predicate/a_draft_is_kept': (p) => on_a_record(a_draft)(a_draft_s(p.draft_id), (draft) => draft !== undefined),
    'user/drafts/predicate/the_draft_holds_this_text': (p) => on_a_record(a_draft)(a_draft_s(p.draft_id), (draft) => draft?.text === p.text),
};
const draft_selection = {
    ...selection_operators(),
    predicate: {
        'user/drafts/selection/draft/the_draft_has_this_id': (p) => () => (draft) => draft.draft_id === p.draft_id,
    },
};
const draft_sources = {
    a_draft: {
        from: {
            reads: [every_draft],
            candidates: (records) => every_parsed(a_draft)(records, every_draft),
        },
        fields: {
            draft_id: () => (draft) => draft.draft_id,
            for: () => (draft) => draft.for,
            text: () => (draft) => draft.text,
            kept_at: () => (draft) => draft.kept_at,
        },
    },
};
const drafts_writes = {
    'user/drafts/fact/a_draft_has_been_kept': ({ draft }) => ({
        reads: [],
        puts: () => [set(a_draft_s(draft.draft_id), draft)],
    }),
    'user/drafts/fact/a_draft_has_been_kept_again': nothing,
    'user/drafts/fact/a_draft_has_been_dropped': ({ draft_id: id }) => ({
        reads: [],
        puts: () => [deleted(a_draft_s(id))],
    }),
    'user/drafts/fact/a_draft_has_been_dropped_again': nothing,
};
// The choices (USR-6).
const choices_fragments = {
    'user/choices/predicate/this_face_is_the_active_one': (p) => on_a_record(the_active_face)(the_active_face_s, (choice) => choice?.face === p.face),
};
const choice_selection = {
    ...selection_operators(),
    predicate: {
        'user/choices/selection/choice/the_choice_is_this_one': (p) => () => (choice) => choice.choice === p.choice,
    },
};
const choice_sources = {
    the_active_face: {
        from: {
            reads: [the_active_face_s],
            candidates: (records) => {
                const choice = parsed(the_active_face)(records.of(the_active_face_s));
                return choice === undefined ? [] : [choice];
            },
        },
        fields: {
            choice: () => (choice) => choice.choice,
            face: () => (choice) => choice.face,
            since: () => (choice) => choice.since,
        },
    },
};
const choices_writes = {
    'user/choices/fact/the_active_face_has_been_changed': ({ active_face }) => ({
        reads: [],
        puts: () => [set(the_active_face_s, active_face)],
    }),
    'user/choices/fact/the_active_face_has_been_changed_again': nothing,
};
/** The command use cases of `activities`: the screens' (`ask_for_an_activity`) and the executor's return (`end_an_activity`, DOM-14). */
const activities_command_use_cases = { ask_for_an_activity, end_an_activity };
/**
 * The ports of `user`'s three offices on the node's database: the oracle's
 * `user_ports`, each office's commands one transaction over its own store
 * (WEB-9), its reads a snapshot of it. No read streams, as the oracle.
 */
export const user_ports_on_the_node_s_database = (node) => (versions) => {
    const activities = node.domain(activities_path);
    const drafts = node.domain(drafts_path);
    const choices = node.domain(choices_path);
    const activities_reads = reads_in(activities);
    const drafts_reads = reads_in(drafts);
    const choices_reads = reads_in(choices);
    return {
        ...zz.command_use_case_ports({
            registry: activities_registry,
            versions,
            use_cases: activities_command_use_cases,
        })({
            algebra: { predicate: activities_fragments, ...the_operators },
            write: activities_writes,
            execute: execute_in(activities),
            recorded: recorded_in(activities),
        }),
        ...zz.read_use_case_ports({
            registry: activities_registry,
            versions,
            use_cases: { an_activity, the_activities_in_progress },
        })({
            algebra: { ...activity_selection, after },
            sources: activity_sources,
            read: activities_reads.read,
            page: activities_reads.page,
            streams: {},
        }),
        ...zz.command_use_case_ports({
            registry: drafts_registry,
            versions,
            use_cases: { keep_a_draft, drop_a_draft },
        })({
            algebra: { predicate: drafts_fragments, ...the_operators },
            write: drafts_writes,
            execute: execute_in(drafts),
            recorded: recorded_in(drafts),
        }),
        ...zz.read_use_case_ports({
            registry: drafts_registry,
            versions,
            use_cases: { a_draft: a_draft_use_case },
        })({
            algebra: { ...draft_selection, after },
            sources: draft_sources,
            read: drafts_reads.read,
            page: drafts_reads.page,
            streams: {},
        }),
        ...zz.command_use_case_ports({
            registry: choices_registry,
            versions,
            use_cases: { change_face },
        })({
            algebra: { predicate: choices_fragments, ...the_operators },
            write: choices_writes,
            execute: execute_in(choices),
            recorded: recorded_in(choices),
        }),
        ...zz.read_use_case_ports({
            registry: choices_registry,
            versions,
            use_cases: { the_active_face: the_active_face_use_case },
        })({
            algebra: { ...choice_selection, after },
            sources: choice_sources,
            read: choices_reads.read,
            page: choices_reads.page,
            streams: {},
        }),
    };
};

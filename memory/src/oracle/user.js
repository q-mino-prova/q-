// The module of `user` in q-'s oracle (TST-2, MBX-7; USR-1, part 15.2): the
// state of its three offices, beside the kernel's in the phone's cell (the
// activities she asked, her drafts, her choices); its predicates and
// selections as functions of that state, the meaning from the domain's
// `dsl` (DOM-5); its facts' writes; and each office's command and read
// ports over a cell. On the model of `extensions.ts`.
import * as zz from '@q-mino/domains/library';
import { registry as activities_registry } from '@q-mino/domains/user/activities/_registry.ts';
import { registry as drafts_registry } from '@q-mino/domains/user/drafts/_registry.ts';
import { registry as choices_registry } from '@q-mino/domains/user/choices/_registry.ts';
import { activity_card } from '@q-mino/domains/user/activities/_value.ts';
import { the_activity_is_in_progress } from '@q-mino/domains/user/activities/_dsl.ts';
import { an_activity, ask_for_an_activity, end_an_activity, the_activities_in_progress, } from '@q-mino/domains/user/activities/_usecase.ts';
import { a_draft as a_draft_use_case, drop_a_draft, keep_a_draft, } from '@q-mino/domains/user/drafts/_usecase.ts';
import { change_face, the_active_face as the_active_face_use_case, } from '@q-mino/domains/user/choices/_usecase.ts';
import { after, algebra, execute, page, read, recorded, selection_operators, } from "./interpreter.js";
/** A user who asked nothing yet: no activity, no draft, no face chosen. */
export const nothing_asked = {
    user: { activities: new Map(), drafts: new Map(), active_face: undefined },
};
/** The offices after a change of their record. */
const with_the_user = (change) => (state) => ({
    user: { ...state.user, ...change(state.user) },
});
/** A fact that changes nothing (DOM-6). */
const nothing = () => ({});
const the_card = (state, id) => state.user.activities.get(id);
// The activities (USR-2..USR-4).
export const activities_fragments = {
    'user/activities/predicate/an_activity_has_this_id': (p) => (state) => the_card(state, p.activity_id) !== undefined,
    'user/activities/predicate/the_activity_is_in_progress': (p) => (state) => {
        const card = the_card(state, p.activity_id);
        return card !== undefined && the_activity_is_in_progress(card);
    },
};
export const activity_selection = {
    ...selection_operators(),
    predicate: {
        'user/activities/selection/activity/the_activity_has_this_id': (p) => () => (card) => card.activity_id === p.activity_id,
        'user/activities/selection/activity/the_activity_is_in_progress': () => () => (card) => the_activity_is_in_progress(card),
    },
};
const the_activities = (state) => [
    ...state.user.activities.values(),
];
const as_a_card = {
    activity_id: () => (card) => card.activity_id,
    what: () => (card) => card.what,
    asked_at: () => (card) => card.asked_at,
    stage: () => (card) => card.stage,
};
export const activity_sources = {
    an_activity: { from: the_activities, fields: as_a_card },
    the_activities_in_progress: { from: the_activities, fields: as_a_card },
};
/**
 * An activity after its end, parsed as an activity of the office, so that a
 * fact that leaves one in no stage of the domain's fails the story (an
 * interpreter rule, as `extensions.ts`).
 */
export const activities_writes = {
    'user/activities/fact/an_activity_has_been_asked': ({ activity }) => with_the_user((user) => ({
        activities: new Map(user.activities).set(activity.activity_id, activity_card.parse({ ...activity, stage: { stage: 'in_progress' } })),
    })),
    'user/activities/fact/an_activity_has_been_asked_again': () => nothing,
    'user/activities/fact/an_activity_has_ended': ({ activity_id: id, how_it_ended, at }) => with_the_user((user) => {
        const before = user.activities.get(id);
        return before === undefined
            ? {}
            : {
                activities: new Map(user.activities).set(id, activity_card.parse({
                    ...before,
                    stage: { stage: 'ended', how_it_ended, ended_at: at },
                })),
            };
    }),
};
// The drafts (USR-5).
export const drafts_fragments = {
    'user/drafts/predicate/a_draft_is_kept': (p) => (state) => state.user.drafts.has(p.draft_id),
    'user/drafts/predicate/the_draft_holds_this_text': (p) => (state) => state.user.drafts.get(p.draft_id)?.text === p.text,
};
export const draft_selection = {
    ...selection_operators(),
    predicate: {
        'user/drafts/selection/draft/the_draft_has_this_id': (p) => () => (draft) => draft.draft_id === p.draft_id,
    },
};
export const draft_sources = {
    a_draft: {
        from: (state) => [...state.user.drafts.values()],
        fields: {
            draft_id: () => (draft) => draft.draft_id,
            for: () => (draft) => draft.for,
            text: () => (draft) => draft.text,
            kept_at: () => (draft) => draft.kept_at,
        },
    },
};
export const drafts_writes = {
    'user/drafts/fact/a_draft_has_been_kept': ({ draft }) => with_the_user((user) => ({ drafts: new Map(user.drafts).set(draft.draft_id, draft) })),
    'user/drafts/fact/a_draft_has_been_kept_again': () => nothing,
    'user/drafts/fact/a_draft_has_been_dropped': ({ draft_id: id }) => with_the_user((user) => {
        const drafts = new Map(user.drafts);
        drafts.delete(id);
        return { drafts };
    }),
    'user/drafts/fact/a_draft_has_been_dropped_again': () => nothing,
};
// The choices (USR-6).
export const choices_fragments = {
    'user/choices/predicate/this_face_is_the_active_one': (p) => (state) => state.user.active_face?.face === p.face,
};
export const choice_selection = {
    ...selection_operators(),
    predicate: {
        'user/choices/selection/choice/the_choice_is_this_one': (p) => () => (choice) => choice.choice === p.choice,
    },
};
export const choice_sources = {
    the_active_face: {
        from: (state) => (state.user.active_face === undefined ? [] : [state.user.active_face]),
        fields: {
            choice: () => (choice) => choice.choice,
            face: () => (choice) => choice.face,
            since: () => (choice) => choice.since,
        },
    },
};
export const choices_writes = {
    'user/choices/fact/the_active_face_has_been_changed': ({ active_face }) => with_the_user(() => ({ active_face })),
    'user/choices/fact/the_active_face_has_been_changed_again': () => nothing,
};
/** The command use cases of `activities`: the screens' (`ask_for_an_activity`) and the executor's return (`end_an_activity`, DOM-14). */
export const activities_command_use_cases = { ask_for_an_activity, end_an_activity };
/**
 * The ports of `user`'s three offices over the oracle (TST-2): their
 * commands and their reads. No read streams: the screens of step 16 ask for
 * them when they need them.
 */
export const user_ports = (cell) => (versions) => {
    const commands = { execute: execute(cell), recorded: recorded(cell) };
    return {
        ...zz.command_use_case_ports({
            registry: activities_registry,
            versions,
            use_cases: activities_command_use_cases,
        })({
            algebra: algebra(activities_fragments),
            write: activities_writes,
            ...commands,
        }),
        ...zz.read_use_case_ports({
            registry: activities_registry,
            versions,
            use_cases: { an_activity, the_activities_in_progress },
        })({
            algebra: { ...activity_selection, after },
            sources: activity_sources,
            read: read(cell),
            page: page(cell),
            streams: {},
        }),
        ...zz.command_use_case_ports({
            registry: drafts_registry,
            versions,
            use_cases: { keep_a_draft, drop_a_draft },
        })({
            algebra: algebra(drafts_fragments),
            write: drafts_writes,
            ...commands,
        }),
        ...zz.read_use_case_ports({
            registry: drafts_registry,
            versions,
            use_cases: { a_draft: a_draft_use_case },
        })({
            algebra: { ...draft_selection, after },
            sources: draft_sources,
            read: read(cell),
            page: page(cell),
            streams: {},
        }),
        ...zz.command_use_case_ports({
            registry: choices_registry,
            versions,
            use_cases: { change_face },
        })({
            algebra: algebra(choices_fragments),
            write: choices_writes,
            ...commands,
        }),
        ...zz.read_use_case_ports({
            registry: choices_registry,
            versions,
            use_cases: { the_active_face: the_active_face_use_case },
        })({
            algebra: { ...choice_selection, after },
            sources: choice_sources,
            read: read(cell),
            page: page(cell),
            streams: {},
        }),
    };
};

// Her node over the phone's ports (UI-1, USR-9, GR-3, WEB-19; part 22.1):
// the link the rendering writes once between what the composition root
// composed (`user`'s ports, `self`'s reads through the port toward `self`,
// the ticket shown, the news, the node's fact log) and the screens' view of
// it, `HerNode`, in `ui`'s words. `self`'s projections are parsed with the
// schemas of its read leaves' entries, linked to `ui`'s and `user`'s values
// field by field, every case by an exhaustive map, and parsed with their
// schemas: a field `self` adds fails nowhere, one it drops or a case it adds
// fails to compile here (GR-3's form). What a gesture asks is handed to the
// use case of `user` of its name, as the user (`self/the_user`), under an
// operation of its own, drawn before the first attempt (DOM-12); what `user`
// does not take is thrown, so that the screens tell it. A change is told at
// each fact the node's log records after it caught up (DOM-17), and at each
// news written beside it (F6). A part's message the kernel's fence served
// is invoked on its extension's leaves mounted on `self`, as the user, under
// an operation the kernel draws (WEB-23); one it refused is traced. The
// phone's composition root gives it the phone it composed (step 25); the
// stories, a phone of the stack.
import { the_held_letters, the_scope_of_the_user, what_happened_in_a_tree, what_happened_in_the_kernel, } from '@q-mino/adapters-common';
import * as zz from '@q-mino/domains/library';
import * as self_usecase from '@q-mino/domains/persona/self/_usecase.ts';
import * as ui_value from '@q-mino/domains/ui/_value.ts';
import { what_an_extension_asks } from '@q-mino/domains/user/_dsl.ts';
import * as user_value from '@q-mino/domains/user/_value.ts';
import * as activities_value from '@q-mino/domains/user/activities/_value.ts';
import { z } from 'zod';
import { the_link_of_a_ticket } from "../ticket_link/index.js";
/** The scope of a part's commands on `self` (WEB-23): the persona, and who asks through it. */
export const the_scope_of_a_part = 'self/a_part';
/** What came back of the last question asked (the first entry: the last first), in `ui`'s words (UI-5). */
const the_extensions_in_common = (last) => {
    if (last === undefined)
        return { answer: 'not_asked' };
    switch (last.answer.is) {
        case 'waiting':
            return { answer: 'waiting' };
        case 'learned':
            return {
                answer: 'in_common',
                extensions: last.answer.in_common.map((each) => each.extension),
            };
        case 'not_answered':
            return { answer: 'no_answer', why: last.answer.why };
    }
};
/** How the relay client last met the relay, in `ui`'s words: not met yet is as if it answered (UI-5). */
const the_relay_met = (met) => met === 'not_met_yet' ? 'answered' : met;
/** The entries of a read of `self`, parsed with its leaf's schema; a read that closes, or says nothing, is a fault of the app's, never hers. */
const the_entries_of_self = async (entry, events) => {
    for await (const event of events) {
        if (event.event !== 'snapshot')
            throw new Error(`a read of self closed: ${event.event}`);
        return z.array(entry).parse(event['entries']);
    }
    throw new Error('a read of self said nothing');
};
/** The entries of a read of `user`'s; an input it refused is a fault of the app's. */
const the_entries_of_user = async (events) => {
    for await (const event of events) {
        if (event.event === 'snapshot')
            return event.entries;
        throw new Error(`a read of user refused its input: ${event.reason}`);
    }
    throw new Error('a read of user said nothing');
};
/** What `user` did with what was asked: resolved once it took it; thrown otherwise, or if it said nothing. */
const what_user_did = async (answers) => {
    let last = undefined;
    for await (const answer of answers)
        last = answer;
    if (last === undefined)
        throw new Error('user said nothing of what was asked');
    switch (last.outcome) {
        case 'applied':
            return;
        case 'rejected':
        case 'identity_already_used':
        case 'invalid_request':
            throw new Error(`user did not take what was asked: ${last.outcome}`);
    }
};
/** The paths of `user`'s commands a gesture is handed to, which their fingerprints name (DOM-11). */
const the_paths = {
    ask_for_an_activity: 'user/activities/usecase/ask_for_an_activity',
    keep_a_draft: 'user/drafts/usecase/keep_a_draft',
    drop_a_draft: 'user/drafts/usecase/drop_a_draft',
    change_face: 'user/choices/usecase/change_face',
};
/** Whether they have her yet, in the screens' words. */
const the_confirmation_of = (confirmation) => {
    switch (confirmation.state) {
        case 'awaited':
            return { state: 'awaited' };
        case 'received':
            return { state: 'received', at: confirmation.at };
    }
};
/** How they shook hands, in the screens' words. */
const the_ways = {
    in_person: 'in_person',
    at_a_distance: 'at_a_distance',
};
/** Whether an extension is active, in the screens' words (EXT-7, EXT-10). */
const what_it_is = {
    active: 'active',
    not_active: 'not_active',
    waiting_for_the_new_manifest: 'waiting_for_the_new_manifest',
};
/** An extension point of a manifest, in her words (EXT-16). */
const the_points = {
    action: 'action',
    slot: 'slot',
    page: 'page',
};
/** A manifest as she is shown it (EXT-7): `self`'s, in `user`'s words, which name what it sees and touches; one she cannot be told is not shown. */
const the_manifest_she_is_shown = (manifest) => user_value.a_manifest.parse({
    name: manifest.name,
    version: manifest.version,
    sees: { known: manifest.sees.known },
    touches: manifest.touches,
    extension_points: manifest.extension_points.map((point) => ({
        point: the_points[point.point],
        name: point.name,
        place: point.place,
    })),
    leaves_on_known: manifest.leaves_on_known,
    majors: { self: manifest.majors.self, known: manifest.majors.known },
});
/** What a draft of the screens is for, in `user`'s words (USR-5). */
const the_purpose_of = (purpose) => {
    switch (purpose.for) {
        case 'the_name_of_my_first_face':
            return { for: 'the_name_of_my_first_face' };
        case 'the_name_i_give_a_bond':
            return { for: 'the_name_i_give_a_bond', bond: purpose.bond };
    }
};
/** A face of hers, as the screens show it. */
const a_face_seen = (face) => ui_value.a_face_seen.parse({ face: face.face_id, name: face.name });
/** A contact in her list, as the screens show it. */
const a_contact_seen = (bond) => ui_value.a_contact_seen.parse({
    bond: bond.bond_id,
    name: bond.name,
    introduced_as: bond.their_face.introduced_as,
    confirmation: the_confirmation_of(bond.confirmation),
});
/** A contact's card, as the screens show it. */
const a_contact_card = (bond) => ui_value.a_contact_card.parse({
    bond: bond.bond_id,
    name: bond.name,
    introduced_as: bond.their_face.introduced_as,
    confirmation: the_confirmation_of(bond.confirmation),
    handshake: { way: the_ways[bond.handshake.way], at: bond.handshake.at },
    their_relays: bond.their_mailbox.relays,
});
/** Her ticket ready, as the screens show it. */
const a_ticket_ready = (ticket) => ui_value.a_ticket_ready.parse({ bond: ticket.bond_id, expires_at: ticket.expires_at });
/** An extension, as the screens show it, with what it asks (USR-7). */
const an_extension_seen = (extension) => {
    const manifest = the_manifest_she_is_shown(extension.manifest);
    return ui_value.an_extension_seen.parse({
        extension: extension.extension,
        version: manifest.version,
        is: what_it_is[extension.state.is],
        manifest,
        what_it_asks: what_an_extension_asks(manifest),
    });
};
/** What her node offers a bond, in `user`'s words (EXT-8). */
const what_is_offered = (offers) => activities_value.offered.parse(offers.map((offer) => ({ extension: offer.extension, majors: offer.majors })));
/** Her node, as the screens see it, over the phone's ports. */
export const her_node_over = (wiring) => {
    const now = () => ({
        now: wiring.clock.now(),
        time_zone: wiring.clock.time_zone,
    });
    /** The context of a command of the user's (DOM-11): now, under an operation drawn for it, in the user's scope. */
    const as_the_user = (path, input) => {
        const id = wiring.draws_an_id();
        return {
            ...now(),
            operation: { id: zz.operation_id.parse(id), scope: the_scope_of_the_user },
            correlation: zz.correlation.parse(id),
            fingerprint: zz.fingerprint_of({ path, input }),
        };
    };
    const her_contacts = async () => (await the_entries_of_self(self_usecase.my_bonds[zz.$UseCase].entry, wiring.self('my_bonds', {}))).map(a_contact_seen);
    const offered_to = async (bond) => what_is_offered(await the_entries_of_self(self_usecase.the_extensions_offered_to_a_bond[zz.$UseCase].entry, wiring.self('the_extensions_offered_to_a_bond', { bond_id: bond })));
    const her_ticket = async (bond) => {
        const [ready] = await the_entries_of_self(self_usecase.my_ticket[zz.$UseCase].entry, wiring.self('my_ticket', { bond_id: bond }));
        if (ready === undefined)
            return undefined;
        const shown = await wiring.the_ticket_shown(bond);
        if (shown === undefined)
            return undefined;
        return { ready: a_ticket_ready(ready), link: the_link_of_a_ticket(wiring.the_page)(shown) };
    };
    /** The bonds each extension is offered to (EXT-7): what her node offers each of her bonds, by extension, in the order met. */
    const the_offers = async () => {
        const offers = await Promise.all((await her_contacts()).map(async (contact) => ({
            bond: contact.bond,
            offered: await offered_to(contact.bond),
        })));
        const extensions = [
            ...new Set(offers.flatMap((offer) => offer.offered.map((each) => each.extension))),
        ];
        return ui_value.the_offers.parse(extensions.map((extension) => ({
            extension,
            bonds: offers
                .filter((offer) => offer.offered.some((each) => each.extension === extension))
                .map((offer) => offer.bond),
        })));
    };
    /** The extensions the app carries, in its order, each as the office reads it (`an_extension`); one the office does not know is not shown. */
    const the_extensions = async () => (await Promise.all(wiring
        .the_extensions_installed()
        .map((name) => the_entries_of_self(self_usecase.an_extension[zz.$UseCase].entry, wiring.self('an_extension', { extension: name })))))
        .flat()
        .map(an_extension_seen);
    const asks = (what) => {
        switch (what.asks) {
            case 'an_activity': {
                const input = { activity_id: what.activity_id, what: what.what };
                return what_user_did(wiring.user.ask_for_an_activity(as_the_user(the_paths.ask_for_an_activity, input), input));
            }
            case 'to_keep_a_draft': {
                const input = { for: the_purpose_of(what.for), text: what.text };
                return what_user_did(wiring.user.keep_a_draft(as_the_user(the_paths.keep_a_draft, input), input));
            }
            case 'to_drop_a_draft': {
                const input = { for: the_purpose_of(what.for) };
                return what_user_did(wiring.user.drop_a_draft(as_the_user(the_paths.drop_a_draft, input), input));
            }
            case 'to_change_face': {
                const input = { face: what.face };
                return what_user_did(wiring.user.change_face(as_the_user(the_paths.change_face, input), input));
            }
        }
    };
    /**
     * Tell each fact the log records once it caught up, and each news
     * written, until stopped: one iteration of the log, each step its next
     * event or the stop (as the office's follower, EXT-15). A position the
     * log keeps no longer, or a log that fails, ends it, told once: the
     * screens read her node again, whose reads tell what is wrong.
     */
    const when_it_changes = (tell) => {
        let following = true;
        let stop_now = () => undefined;
        const stopped = new Promise((resolve) => {
            stop_now = () => {
                resolve('stopped');
            };
        });
        const told = () => {
            if (following)
                tell();
        };
        const log = wiring.the_log(undefined)[Symbol.asyncIterator]();
        const follows = async () => {
            let caught_up = false;
            while (following) {
                const woke = await Promise.race([stopped, log.next()]);
                if (woke === 'stopped' || woke.done === true)
                    return;
                switch (woke.value.event) {
                    case 'position_unavailable':
                        told();
                        return;
                    case 'caught_up':
                        caught_up = true;
                        break;
                    case 'fact':
                        if (caught_up)
                            told();
                        break;
                }
            }
        };
        void follows().catch(told);
        const stop_the_news = wiring.the_news.when_written(told);
        const stop_the_relay = wiring.the_relay.as_met.when_it_changes(told);
        const stop_the_network = wiring.the_network.when_it_changes(told);
        return () => {
            following = false;
            stop_now();
            stop_the_news();
            stop_the_relay();
            stop_the_network();
            void log.return?.().catch(() => undefined);
        };
    };
    /**
     * What a part asks (EXT-16, WEB-23): its extension's leaf on `self`,
     * invoked as the user (`self` is her persona: the part acts on her node,
     * shown in the mark as its extension's activity), a command under an
     * operation the kernel draws in the parts' scope, never the part's id,
     * which pairs its exchange only; a read with none. An extension the app
     * does not carry gives nothing.
     */
    const a_part_asks = async function* (served) {
        const on_self = wiring.the_parts.on_self(served.invokes.extension);
        if (on_self === undefined)
            return;
        const version = zz.semver.parse(served.invokes.version);
        const at = now();
        yield* on_self({
            ...at,
            caller: { is: 'the_user' },
            // Declared by her node, at its instant (PER-23): the part acts as the user.
            declared_at: at.now,
            version,
            ...(served.exchange === 'invoke'
                ? {
                    operation: {
                        id: zz.operation_id.parse(wiring.draws_an_id()),
                        scope: the_scope_of_a_part,
                    },
                }
                : {}),
        }, { leaf: served.invokes.use_case, input: served.input });
    };
    return {
        her_faces: async () => (await the_entries_of_self(self_usecase.my_faces[zz.$UseCase].entry, wiring.self('my_faces', {}))).map(a_face_seen),
        the_active_face: async () => (await the_entries_of_user(wiring.user.the_active_face(now(), {})))[0]?.face,
        her_contacts,
        a_contact: async (bond) => {
            const [card] = await the_entries_of_self(self_usecase.a_bond[zz.$UseCase].entry, wiring.self('a_bond', { bond_id: bond }));
            return card === undefined ? undefined : a_contact_card(card);
        },
        her_ticket,
        the_extensions,
        the_offers,
        offered_to,
        the_extensions_in_common_with: async (bond) => the_extensions_in_common((await the_entries_of_self(self_usecase.the_questions_asked_of_a_bond[zz.$UseCase].entry, wiring.self('the_questions_asked_of_a_bond', { bond_id: bond })))[0]),
        the_relay: () => Promise.resolve({
            address: wiring.the_relay.address,
            met: the_relay_met(wiring.the_relay.as_met.last()),
        }),
        the_network: () => Promise.resolve(wiring.the_network.now()),
        an_activity: async (activity_id) => (await the_entries_of_user(wiring.user.an_activity(now(), { activity_id })))[0],
        the_activities_in_progress: () => the_entries_of_user(wiring.user.the_activities_in_progress(now(), {})),
        a_draft: async (purpose) => (await the_entries_of_user(wiring.user.a_draft(now(), { for: the_purpose_of(purpose) })))[0]
            ?.text,
        the_held_letters: async () => the_held_letters(await wiring.the_news.held()),
        what_happened: () => Promise.resolve([
            ...wiring.the_news.traced().map(what_happened_in_the_kernel),
            ...wiring.the_news.tree_traced().flatMap((entry) => what_happened_in_a_tree(entry) ?? []),
        ]),
        asks,
        a_part_asks,
        a_part_is_fenced: wiring.the_parts.traces,
        when_it_changes,
    };
};

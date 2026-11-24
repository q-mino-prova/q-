// The node of a story (WEB-21, WEB-29): a node of test, which keeps in
// memory what her node would read and records what the screens hand it,
// its activities in progress until a story ends them; and the device's
// sources, ids drawn in the order a story gives them and Saturday 21
// November 2026, 10:00 in Rome. The same for the screens' stories in a DOM
// of test (`phone/test/screens`) and in the gallery (WEB-28), so that the
// gallery draws each case as the tests prove it. Moved here from the tests'
// harness in the MVP's part 2. [Q, C, 24 Nov 2026]
import * as zz from '@q-mino/domains/library';
import * as activities_value from '@q-mino/domains/user/activities/_value.ts';
export const nothing_held = {
    faces: [],
    the_active_face: undefined,
    contacts: [],
    cards: [],
    tickets: [],
    extensions: [],
    offers: [],
    offered: [],
    activities: [],
    drafts: [],
    held_letters: [],
    happened: [],
    in_common: [],
    the_relay: { address: 'https://relay.cumino.test', met: 'answered' },
    the_network: 'not_told',
};
/** Saturday 21 November 2026, 10:00 in Rome, as the clock writes it (UTC). */
export const ten_in_rome = zz.date_time.parse('2026-11-21T09:00:00.000Z');
const the_same = (one, other) => JSON.stringify(one) === JSON.stringify(other);
export const a_node_of_test = (at_the_start = {}) => {
    let held = { ...nothing_held, ...at_the_start };
    let handed = [];
    let listeners = [];
    const tell = () => {
        for (const listener of listeners)
            listener();
    };
    const comes_to_hold = (change) => {
        held = change(held);
        tell();
    };
    const takes = (what) => {
        handed = [...handed, what];
        switch (what.asks) {
            case 'an_activity':
                held = {
                    ...held,
                    activities: [
                        ...held.activities,
                        activities_value.activity_card.parse({
                            activity_id: what.activity_id,
                            what: what.what,
                            asked_at: ten_in_rome,
                            stage: { stage: 'in_progress' },
                        }),
                    ],
                };
                return;
            case 'to_keep_a_draft':
                held = {
                    ...held,
                    drafts: [
                        ...held.drafts.filter((one) => !the_same(one.for, what.for)),
                        { for: what.for, text: what.text },
                    ],
                };
                return;
            case 'to_drop_a_draft':
                held = { ...held, drafts: held.drafts.filter((one) => !the_same(one.for, what.for)) };
                return;
            case 'to_change_face':
                held = { ...held, the_active_face: what.face };
                return;
        }
    };
    const node = {
        her_faces: () => Promise.resolve(held.faces),
        the_active_face: () => Promise.resolve(held.the_active_face),
        her_contacts: () => Promise.resolve(held.contacts),
        a_contact: (bond) => Promise.resolve(held.cards.find((card) => card.bond === bond)),
        her_ticket: (bond) => Promise.resolve(held.tickets.find((ticket) => ticket.ready.bond === bond)),
        the_extensions: () => Promise.resolve(held.extensions),
        the_offers: () => Promise.resolve(held.offers),
        offered_to: (bond) => Promise.resolve(held.offered.find((one) => one.bond === bond)?.offered ?? []),
        the_extensions_in_common_with: (bond) => Promise.resolve(held.in_common.find((one) => one.bond === bond)?.answer ?? { answer: 'not_asked' }),
        the_relay: () => Promise.resolve(held.the_relay),
        the_network: () => Promise.resolve(held.the_network),
        an_activity: (activity_id) => Promise.resolve(held.activities.find((one) => one.activity_id === activity_id)),
        the_activities_in_progress: () => Promise.resolve(held.activities.filter((one) => one.stage.stage === 'in_progress')),
        a_draft: (purpose) => Promise.resolve(held.drafts.find((one) => the_same(one.for, purpose))?.text),
        the_held_letters: () => Promise.resolve(held.held_letters),
        what_happened: () => Promise.resolve(held.happened),
        asks: (what) => {
            takes(what);
            return Promise.resolve();
        },
        // No part of an extension is drawn yet (WEB-23): none asks, none is fenced.
        a_part_asks: () => ({
            [Symbol.asyncIterator]: () => ({
                next: () => Promise.resolve({ done: true, value: undefined }),
            }),
        }),
        a_part_is_fenced: () => undefined,
        when_it_changes: (listener) => {
            listeners = [...listeners, listener];
            return () => {
                listeners = listeners.filter((one) => one !== listener);
            };
        },
    };
    return {
        node,
        handed: () => handed,
        activities_asked: () => handed.flatMap((one) => (one.asks === 'an_activity' ? [one.what] : [])),
        holds: () => held,
        comes_to_hold,
        ends: (activity_id, how) => {
            comes_to_hold((now) => ({
                ...now,
                activities: now.activities.map((one) => one.activity_id === activity_id
                    ? activities_value.activity_card.parse({
                        ...one,
                        stage: { stage: 'ended', how_it_ended: how, ended_at: ten_in_rome },
                    })
                    : one),
            }));
        },
    };
};
/** A phone's sharing of test: its share, or none (a browser with no Web Share), and its clipboard, each recording what it was given. */
export const a_sharing_of_test = (with_a_share) => {
    let shared = [];
    let copied = [];
    return {
        ...(with_a_share
            ? {
                share: (data) => {
                    shared = [...shared, data.url];
                    return Promise.resolve();
                },
            }
            : {}),
        clipboard: {
            writeText: (text) => {
                copied = [...copied, text];
                return Promise.resolve();
            },
        },
        shared: () => shared,
        copied: () => copied,
    };
};
/** The device of a story: the ids it draws, in order (A1, F_a…), the time at ten in Rome, a camera that a story gives or none, a phone that shares. */
export const a_device_of_test = (ids, scans = () => Promise.resolve({ is: 'missing' }), the_navigator = a_sharing_of_test(true)) => {
    let left = [...ids];
    return {
        draws_an_id: () => {
            const [next, ...rest] = left;
            if (next === undefined)
                throw new Error('the story drew more ids than it gave');
            left = rest;
            return next;
        },
        clock: { now: () => ten_in_rome, time_zone: zz.time_zone.parse('Europe/Rome') },
        scans,
        the_navigator,
    };
};

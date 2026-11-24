import * as zz from '@q-mino/domains/library';
import * as activations_value from '@q-mino/domains/extensions/activations/_value.ts';
import { the_extensions_in_common } from '@q-mino/domains/persona/known/_usecase.ts';
import { known } from '@q-mino/domains/persona/known/_version.ts';
import { z } from 'zod';
// The kernel's adapter over its office of the extensions (EXT-7, GR-3,
// GR-10; part 12.4): `domains` never imports `boundary`, so the kernel's
// adapters translate. The manifest the composition read (`boundary`'s, the
// data form) into the manifest as the office keeps it and the user accepts
// it; and what the kernel's routing, its port of requests and its hosting
// read of the office (`is_active`, `is_offered`, the lists `route` takes),
// as functions over the office's read ports, which the configurator gives:
// the oracle's on `memory`, the phone's from step 22. And the delivery of
// the office's question, the extensions in common (EXT-8), over the
// kernel's own port of requests (part 13.3).
/**
 * A composed extension's manifest in the office's words (EXT-7, EXT-10): its
 * name and version, what it sees on `known` and touches, its extension
 * points (each action, slot and page by name, in its place), its leaves on
 * `known` at any major, by path, and the majors of its surfaces on each
 * persona. Parsed by the office's schema, so that a manifest the office
 * cannot keep fails here, at composition, never at the user's gesture.
 */
export const the_manifest_to_accept = (manifest) => activations_value.manifest.parse({
    name: manifest.name,
    version: manifest.version,
    sees: { known: [...manifest.sees.known] },
    touches: [...manifest.touches],
    extension_points: [
        ...Object.entries(manifest.actions).map(([name, action]) => ({
            point: 'action',
            name,
            place: action.on,
        })),
        ...Object.entries(manifest.slots).map(([name, slot]) => ({
            point: 'slot',
            name,
            place: slot.on,
        })),
        ...Object.entries(manifest.pages).map(([name, page]) => ({
            point: 'page',
            name,
            place: page.on,
        })),
    ],
    leaves_on_known: [
        ...new Set(Object.values(manifest.surfaces.known?.majors ?? {}).flatMap((leaves) => Object.keys(leaves))),
    ],
    majors: {
        self: Object.keys(manifest.surfaces.self?.majors ?? {}).map(Number),
        known: Object.keys(manifest.surfaces.known?.majors ?? {}).map(Number),
    },
});
/** The entries of a read's snapshot, its first event; none for a refused input (a name or a bond out of the office's form). */
const the_entries_of = async (events) => {
    for await (const event of events)
        return event.event === 'snapshot' ? event.entries : [];
    return [];
};
/**
 * The kernel's reads of its office (EXT-6, EXT-7), over the office's read
 * ports and the node's clock: each read at the instant it is asked, so that
 * a deactivation or a withdrawal holds from the next request, the next
 * call, the next load.
 */
export const the_kernels_reads = (wiring) => {
    const now = () => ({
        now: wiring.clock.now(),
        time_zone: wiring.clock.time_zone,
    });
    const is_active = async (extension) => (await the_entries_of(wiring.office.an_extension(now(), { name: extension })))[0]?.state.is ===
        'active';
    const the_extensions_offered_to = async (bond) => (await the_entries_of(wiring.office.the_extensions_offered_to_a_bond(now(), { bond }))).map((offered) => offered.name);
    return {
        is_active,
        is_offered: async (extension, bond) => (await the_extensions_offered_to(bond)).includes(extension),
        the_active_among: async (installed) => {
            const active = await Promise.all(installed.map(is_active));
            return installed.filter((_, at) => active[at] === true);
        },
        the_extensions_offered_to,
    };
};
// The delivery of `ask_for_the_extensions_in_common` (EXT-8, F7; part
// 13.3): its world is the kernel's read leaf `the_extensions_in_common` on
// the peer's `known`, reached through the kernel's own port of requests,
// which sends the request on the bond and answers with the peer's response,
// `no_response` at its time, or the bond gone. Every case maps onto the
// office's closed set, the input of its return, or exhausts the delivery
// with its reason, a dead letter shown (DOM-15); never an exception, so
// that one peer's response never stops the effect toward the other bonds.
/** The effect this delivery delivers, by its path (DOM-24). */
const the_effect = 'extensions/activations/effect/ask_for_the_extensions_in_common';
/** The leaf it invokes on the peer's `known`, by its path in the surface (EXT-5). */
const the_leaf = 'usecase/the_extensions_in_common';
/**
 * The snapshot of `the_extensions_in_common` as the peer's leaf gives it
 * (F7, PER-18: one page, every entry): its entries, each in the leaf's own
 * schema, the persona's `{ extension, majors }`. The page's position and
 * total, the peer's, are read by no one here.
 */
const the_snapshot_of_the_leaf = z.object({
    event: z.literal('snapshot'),
    entries: z.array(the_extensions_in_common[zz.$UseCase].entry),
});
/**
 * What came back of a peer's response, a claim (F2): the leaf's snapshot,
 * each entry's `extension` the office's `name`, the whole parsed by the
 * office's `offered_extensions`, the extensions in common; any other event
 * (a closing of the peer's node, a base event), or a snapshot that does not
 * parse, a peer that cannot answer. Nothing it claims is filtered: the
 * software informs (F2, EXT-8).
 */
const what_came_back_of = (event) => {
    const snapshot = the_snapshot_of_the_leaf.safeParse(event);
    const in_common = snapshot.success
        ? activations_value.offered_extensions.safeParse(snapshot.data.entries.map((entry) => ({ name: entry.extension, majors: entry.majors })))
        : undefined;
    return in_common?.success === true
        ? { outcome: 'the_extensions_in_common_came_back', in_common: in_common.data }
        : { outcome: 'no_answer_came_back', why: 'the_peer_cannot_answer' };
};
/**
 * The delivery of a question about the extensions in common (EXT-8): the
 * kernel's port of requests called with the effect's path and the entry's
 * id (from which the kernel composes the request's identity, F7), the bond,
 * `the_extensions_in_common` on `known` at the version of `known`'s surface
 * the node speaks (its current, PER-17), what the node offers the bond
 * (the office's `name`, the persona's `extension`), and the time the
 * question waits. `responded` and `no_response` are delivered to the
 * return, as what came back; a question too large for a letter, as
 * `no_response` (A, 23 Nov 2026: the port traced why, F6); the bond gone
 * is exhausted with its reason.
 */
export const the_delivery_of_the_extensions_in_common = (port) => async (entry) => {
    const answer = await port({
        effect: the_effect,
        id: entry.id,
        bond: entry.payload.bond,
        invokes: { persona: 'known', use_case: the_leaf, version: known[zz.$Version] },
        input: {
            offered: entry.payload.offered.map((offered) => ({
                extension: offered.name,
                majors: [...offered.majors],
            })),
        },
        waits: entry.payload.waits,
    });
    const returned = (what_came_back) => ({
        outcome: 'delivered',
        returns: { question_id: entry.payload.question_id, what_came_back },
    });
    switch (answer.answer) {
        case 'responded':
            return returned(what_came_back_of(answer.event));
        case 'no_response':
        case 'too_large_for_a_letter':
            return returned({ outcome: 'no_answer_came_back', why: 'no_response' });
        case 'the_bond_is_gone':
            return { outcome: 'exhausted', reason: 'the bond is gone' };
    }
};

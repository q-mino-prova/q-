import * as zz from '@q-mino/domains/library';
/** The entries of a read's snapshot, its first event; none for a refused input (a key out of the read's form). */
const the_entries_of = async (events) => {
    for await (const event of events)
        return event.event === 'snapshot' ? event.entries : [];
    return [];
};
/** A value known (D30). */
const known = (value) => ({ answer: 'known', value });
/** Nothing known: a lookup's answer when the key leads to no value (D30). */
const not_known = { answer: 'not_known' };
/**
 * The acquaintances over the address book and the office (PER-22):
 * - `the_bond_of_a_face_at_my_mailbox`: the bond kept at the mailbox whose
 *   face's key is the one asked with, with the face of mine it belongs to
 *   and the name the user gives it; not known when no bond is kept there,
 *   or the one kept there is another face's (a known key outside its bond);
 * - `the_ticket_a_face_presents_at_my_mailbox`: a ready ticket of mine at
 *   the mailbox, or the bond kept there with that face (the crossed QR,
 *   BND-11), with the face of mine and the key asked with; not known
 *   otherwise;
 * - `the_extensions_offered_to_the_bond_of_a_key` (EXT-6): not known
 *   without the bond of the first lookup; else the extensions the office
 *   offers that bond, each with its majors on `known`, an empty list when
 *   none.
 */
export const the_acquaintances = (wiring) => {
    const now = () => ({
        now: wiring.clock.now(),
        time_zone: wiring.clock.time_zone,
    });
    /** The bond kept at the mailbox, if its face is the one asked with. */
    const the_bond_kept_with = async (asked) => {
        const [kept] = await the_entries_of(wiring.address_book.the_bond_at_my_mailbox(now(), { deposit_address: asked.mailbox }));
        return kept?.their_face.key === asked.face ? kept : undefined;
    };
    const the_bond_of_a_face_at_my_mailbox = async (asked) => {
        const kept = await the_bond_kept_with(asked);
        if (kept === undefined)
            return not_known;
        const [card] = await the_entries_of(wiring.address_book.a_bond(now(), { bond_id: kept.id }));
        return card === undefined
            ? not_known
            : known({
                bond_id: kept.id,
                my_face_id: kept.my_face_id,
                their_key: asked.face,
                name: card.name,
            });
    };
    return {
        the_bond_of_a_face_at_my_mailbox,
        the_ticket_a_face_presents_at_my_mailbox: async (asked) => {
            const [ticket] = await the_entries_of(wiring.address_book.the_ticket_at_my_mailbox(now(), { deposit_address: asked.mailbox }));
            const presented = ticket ?? (await the_bond_kept_with(asked));
            return presented === undefined
                ? not_known
                : known({ bond_id: presented.id, my_face_id: presented.my_face_id, their_key: asked.face });
        },
        the_extensions_offered_to_the_bond_of_a_key: async (asked) => {
            const bond = await the_bond_of_a_face_at_my_mailbox(asked);
            if (bond.answer === 'not_known')
                return not_known;
            const offered = await the_entries_of(wiring.office.the_extensions_offered_to_a_bond(now(), { bond: bond.value.bond_id }));
            return known(offered.map((each) => ({ extension: each.name, majors: [...each.majors] })));
        },
    };
};

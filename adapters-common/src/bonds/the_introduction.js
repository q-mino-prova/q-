import * as zz from '@q-mino/domains/library';
import { the_content_a_ticket_s_secret_signs } from '@q-mino/domains/bonds/address_book/_dsl.ts';
import { unknown } from '@q-mino/domains/persona/unknown/_version.ts';
import { z } from 'zod';
/** The entries of a read's snapshot, its first event; none for a refused input. */
const the_entries_of = async (events) => {
    for await (const event of events)
        return event.event === 'snapshot' ? event.entries : [];
    return [];
};
/** The effect this delivery delivers, by its path (DOM-24). */
const the_effect = 'bonds/address_book/effect/send_my_introduction';
/** The leaf it invokes on the peer's `unknown`, by its path in the surface (EXT-5, PER-11). */
const the_leaf = 'usecase/introduce_myself';
/** How long an introduction waits for its answer, in seconds: the 48 hours of the ticket it goes to (BND-8). */
export const the_time_an_introduction_waits = 172_800;
/** The events of `introduce_myself` that say the bond is made or confirmed on the peer's node (PER-11): the introduction is delivered. */
const bonded = new Set([
    'you_are_bonded',
    'you_met_in_person',
    'the_bond_is_confirmed',
    'you_introduced_yourself_already',
]);
/** A response's event as the delivery reads it, a claim (F2): its name, if it has one. */
const an_event = z.object({ event: z.string() });
/**
 * The delivery of `send_my_introduction` (BND-10, F7): my side of the bond
 * read now (the bond kept, my face of it and its name, my mailbox of the
 * bond); then the kernel's port of requests called with the effect's path
 * and the entry's id (the request's identity, F7), the bond, the leaf
 * `introduce_myself` of `unknown` at the version the node speaks (its
 * current, PER-17), their ticket's secret, my face's name and my mailbox,
 * waiting the ticket's 48 hours. The effect has no return: a response that
 * says the bond is made or confirmed delivers it; any other answer
 * exhausts it with its reason, a dead letter shown to the user (DOM-15,
 * F6): a ticket that cannot be used, a closing of the peer's node, no
 * response in time, an introduction too large for a letter (PST-12), the
 * bond gone, my side not found.
 */
export const the_delivery_of_my_introduction = (wiring) => async (entry) => {
    const now = () => ({
        now: wiring.clock.now(),
        time_zone: wiring.clock.time_zone,
    });
    const my_side = async () => {
        const [bond] = await the_entries_of(wiring.address_book.a_bond(now(), { bond_id: entry.payload.bond_id }));
        if (bond === undefined)
            return { side: 'not_found', why: `no bond ${entry.payload.bond_id} kept` };
        const face = (await the_entries_of(wiring.address_book.my_faces(now(), {}))).find((mine) => mine.id === bond.my_face_id);
        if (face === undefined)
            return { side: 'not_found', why: `no face ${bond.my_face_id} made` };
        return { side: 'read', introduced_as: face.name, mailbox: bond.my_mailbox };
    };
    const mine = await my_side();
    if (mine.side === 'not_found')
        return { outcome: 'exhausted', reason: mine.why };
    const answer = await wiring.the_kernels_port({
        effect: the_effect,
        id: entry.id,
        bond: entry.payload.bond_id,
        invokes: { persona: 'unknown', use_case: the_leaf, version: unknown[zz.$Version] },
        input: {
            secret: entry.payload.their_ticket.secret,
            introduced_as: mine.introduced_as,
            mailbox: {
                deposit_address: mine.mailbox.deposit_address,
                relays: [...mine.mailbox.relays],
            },
        },
        waits: the_time_an_introduction_waits,
    });
    switch (answer.answer) {
        case 'responded': {
            const said = an_event.safeParse(answer.event);
            if (!said.success)
                return { outcome: 'exhausted', reason: 'they answered no event' };
            return bonded.has(said.data.event)
                ? { outcome: 'delivered' }
                : { outcome: 'exhausted', reason: `they answered ${said.data.event}` };
        }
        case 'no_response':
            return { outcome: 'exhausted', reason: 'no response in 48 hours' };
        case 'too_large_for_a_letter':
            return { outcome: 'exhausted', reason: 'too large for a letter' };
        case 'the_bond_is_gone':
            return { outcome: 'exhausted', reason: 'the bond is gone' };
    }
};
/**
 * The ticket of a bond as its holder shows it, in a QR or after `#` in a
 * link (BND-8, BND-9): my ticket ready, read now, with its secret, my face's
 * signature over its D (`the_content_a_ticket_s_secret_signs`), made by the
 * safe through the post's machine and kept nowhere; none for a ticket not
 * ready. In the address book's words, `their_ticket` as the other node opens
 * it.
 */
export const the_ticket_shown = (wiring) => async (bond_id) => {
    const [ticket] = await the_entries_of(wiring.address_book.my_ticket({
        now: wiring.clock.now(),
        time_zone: wiring.clock.time_zone,
    }, { bond_id }));
    if (ticket === undefined)
        return undefined;
    const secret = await wiring
        .machine_of(ticket.my_face_id)
        .sign(the_content_a_ticket_s_secret_signs(ticket.my_mailbox.deposit_address));
    return {
        key: ticket.key,
        introduced_as: ticket.introduced_as,
        mailbox: {
            deposit_address: ticket.my_mailbox.deposit_address,
            relays: [...ticket.my_mailbox.relays],
        },
        secret,
    };
};

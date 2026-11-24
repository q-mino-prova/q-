import * as zz from '@q-mino/domains/library';
/** The entries of a read's snapshot, its first event; none for a refused input. */
const the_entries_of = async (events) => {
    for await (const event of events)
        return event.event === 'snapshot' ? event.entries : [];
    return [];
};
/** The mailboxes the node collects now (BND-11), each with its R from the safe (SEA-4); one with no key is a fault of the wiring. */
const the_mailboxes_of = async (wiring, faults) => {
    const now = () => ({
        now: wiring.clock.now(),
        time_zone: wiring.clock.time_zone,
    });
    const mailboxes = await the_entries_of(wiring.address_book.the_mailboxes_i_collect(now(), {}));
    const each = await Promise.all(mailboxes.map(async (mailbox) => {
        const [key] = await the_entries_of(wiring.safe.the_key_of_a_mailbox(now(), { mailbox_key_id: mailbox.id }));
        if (key === undefined) {
            faults.push(new Error(`no key of the mailbox of ${mailbox.id} in the safe (SEA-4)`));
            return undefined;
        }
        return {
            deposit_address: mailbox.my_mailbox.deposit_address,
            collect_secret: key.collect_secret,
            relays: mailbox.my_mailbox.relays,
        };
    }));
    return each.filter((mailbox) => mailbox !== undefined);
};
/**
 * The collector (DOM-17): `collects()`, one pass. For each mailbox the node
 * collects, its deposits at the relay, in the relay's order; each not seen
 * yet (by its D and its deposit id, kept while the node runs) handed to the
 * entry as `{ came_to, envelope }`, then seen. One the entry throws on stays
 * unseen, and the rest of that mailbox waits behind it for the next pass. A
 * collect that throws (the transport down) leaves that mailbox for the next
 * pass. Either way the other mailboxes go on, and the first fault is thrown
 * once the pass is over, so that a pass that met one says so: a collect's
 * fault as an entry's, not one that stops the pass (a relay down would keep
 * the node from the mailboxes at the others). A mailbox the safe has no key
 * of is a fault of the wiring, thrown likewise.
 */
export const the_collector = (wiring) => {
    const seen = new Set();
    return async () => {
        const faults = [];
        for (const mailbox of await the_mailboxes_of(wiring, faults)) {
            let deposits;
            try {
                deposits = await wiring.collect(mailbox);
            }
            catch (fault) {
                faults.push(fault);
                continue;
            }
            for (const deposit of deposits) {
                const at = `${mailbox.deposit_address}/${deposit.deposit_id}`;
                if (seen.has(at))
                    continue;
                const collected = { came_to: mailbox.deposit_address, envelope: deposit.envelope };
                try {
                    await wiring.entry(collected);
                }
                catch (fault) {
                    faults.push(fault);
                    break;
                }
                seen.add(at);
                wiring.handed?.(collected);
            }
        }
        if (faults.length > 0)
            throw faults[0];
    };
};

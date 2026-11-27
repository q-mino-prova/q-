// The `memory` stack (CFG-3, TST-2, PER-19; step 17): phones and the relay
// in one process, `mailbox` imported in place of HTTP and reached only
// through the personas of the relay's desk. One relay over its cell, its
// waits' executor wired and not started; phones over it, each over a cell
// of its own, the post's deposits and the collector's reads carried to the
// relay by the two transports in process (`the_relay_s_transports`). A
// phone's transports pass through a hook, so that a test decorates them
// (TST-4: loss, duplication, abort, ADP-5) and an adapter's step puts its
// own in their place (TST-1: HTTP in step 20, the phone's in step 25). The
// stack keeps no state of its own and starts no consumer: what runs, and
// when, is its caller's (CFG-2).
import { depositor } from '@q-mino/domains/desk/depositor/_version.ts';
import { holder } from '@q-mino/domains/desk/holder/_version.ts';
import * as zz from '@q-mino/domains/library';
import { cell } from "../oracle/index.js";
import { a_new_phone, on_the_cell, phone, } from "../phone/index.js";
import { a_new_relay, relay, the_desks_interface, the_scope_of_a_deposit, } from "../relay/index.js";
/** Every event of a port's stream, until it ends. */
const every_event_of = async (events) => {
    const every = [];
    for await (const event of events)
        every.push(event);
    return every;
};
/** The relay's answer to a deposit, in the post's words (PST-10): its last event. */
const told_in_the_post_s_words = (events) => {
    const answer = events.at(-1)?.event;
    if (answer === 'the_envelope_is_kept')
        return { outcome: 'kept' };
    if (answer === 'identity_already_used')
        return { outcome: 'kept_already' };
    return { outcome: 'refused', why: answer ?? 'no_event' };
};
/**
 * The transports between a phone and the relay, in process (CFG-3, ADP-4,
 * MBX-6): what a phone's request shows turned into the desk's `Caller` by
 * the desk's interface, and the request handed to the tree of its persona
 * at the relay's instant, at the version of the desk's surface the stack
 * was built at. A deposit shows nothing and goes to the depositor, under
 * the post's operation in the depositor's scope (PST-11): the relay's
 * answer told in the post's words, `kept`, `kept_already` (its
 * `identity_already_used`) or `refused` with what it said. A collect shows
 * the mailbox's R and goes to the holder: the deposits of its snapshot, in
 * the relay's order, the stream let go; a read that does not begin with a
 * snapshot throws, as a transport that fails. The transports carry the
 * request and its answer, and translate nothing more (ADP-4); the relays a
 * mailbox declares are this one, in process.
 */
export const the_relay_s_transports = (desk, side) => {
    const the_interface = the_desks_interface(side.hash);
    const now = () => ({
        now: side.clock.now(),
        time_zone: side.clock.time_zone,
    });
    return {
        mailbox: {
            deposit: async (deposit) => {
                const caller = await the_interface({ shows: 'nothing' });
                const operation = zz.operation_id.parse(deposit.operation);
                const events = await every_event_of(desk.depositor.deposit_an_envelope({
                    caller,
                    version: depositor[zz.$Version],
                    ...now(),
                    operation: { id: operation, scope: the_scope_of_a_deposit },
                    correlation: zz.correlation.parse(deposit.operation),
                }, { deposit_address: deposit.deposit_address, envelope: deposit.envelope }));
                return told_in_the_post_s_words(events);
            },
        },
        collect: async (mailbox) => {
            const caller = await the_interface({
                shows: 'a_collect_secret',
                secret: mailbox.collect_secret,
            });
            const stream = desk.holder
                .collect_the_envelopes({ caller, version: holder[zz.$Version], ...now() }, { deposit_address: mailbox.deposit_address })[Symbol.asyncIterator]();
            const first = await stream.next();
            await stream.return?.();
            if (first.done === true)
                throw new Error(`the collect at ${mailbox.deposit_address} ended`);
            if (first.value.event !== 'snapshot')
                throw new Error(`the collect at ${mailbox.deposit_address} began with ${first.value.event}`);
            return first.value.entries.map((entry) => ({
                deposit_id: entry.deposit_id,
                envelope: entry.envelope,
            }));
        },
    };
};
/**
 * The `memory` stack (CFG-3): the relay over its cell, a new relay's unless
 * given, started in its world; the transports in process to its desk; and
 * phones started over it, each through the hook of its transports (CFG-2:
 * a phone's composition fault stops its start). Its waits' executor and
 * the phones' consumers are wired, not started: the caller runs them.
 */
export const a_stack = (relay_cell = cell({ initial: a_new_relay }), release = {}) => async (world) => {
    const the_relay = await relay(relay_cell, release)({
        clock: world.clock,
        elapsed: world.elapsed,
    });
    const in_process = the_relay_s_transports(the_relay, world);
    return {
        /** The relay, its desk's trees, its fact log and its waits' executor, a function that starts it (DOM-14). */
        relay: the_relay,
        /** The transports in process to the relay's desk, as every phone is given them before its hook. */
        transports: in_process,
        /** A phone started over the relay, its transports through its hook. */
        a_phone: (given) => {
            const transports = given.transports === undefined ? in_process : given.transports(in_process);
            return phone(given.storage ?? on_the_cell(given.cell ?? cell({ initial: a_new_phone })), given.release)({
                ...given.world,
                mailbox: transports.mailbox,
                collect: transports.collect,
            });
        },
    };
};

import { operation_id } from "./context.js";
import { $Order } from "./component.js";
import { kind_of } from "./kind.js";
import { $Versions } from "./registry.js";
import { fingerprint_of } from "./stable.js";
import { $UseCase } from "./use_case.js";
import { called_with, is_a_record, paths_in, served_by } from "./runtime.js";
import { freed_in, lanes_of, outcome_of, predicates_of, share } from "./consumer.js";
// The effect executor (DOM-14, DOM-15, PER-12; part 7.1): an internal entry,
// a durable consumer of a domain's outbox, one delivery unit per effect.
// Since part 7.2 its holds per resource (SC-53, SC-55, SC-56): a dead letter
// holds its entry's resources for its effect, the entries behind it wait,
// and an operator resolves it through the running executor.
/**
 * The library's delivery of an effect with no world (a wait: the eve of a
 * due date): the payload back, as the return's input. The executor waits
 * for `not_before` for every effect, so this one only answers: never
 * transient nor exhausted. It fits an effect whose payload is its return's
 * input. A timer is not a construct (A, 13 Nov 2026 (3)).
 */
export const returns_the_payload = (entry) => Promise.resolve({ outcome: 'delivered', returns: entry.payload });
export function effect_executor(executor) {
    return runtime_executor(executor);
}
/** How long the executor pauses before a transient delivery is tried again: implementation freedom (D114). */
const retry_after = 60_000;
/** What a delivery answered (`Delivered`), read at runtime: one that is none of its cases is the delivery's fault. */
const told_by = (effect, answered) => {
    if (!is_a_record(answered))
        throw new Error(`the delivery of ${effect} answered no outcome (DOM-15)`);
    const outcome = answered['outcome'];
    if (outcome === 'transient')
        return { outcome };
    if (outcome === 'exhausted') {
        const reason = answered['reason'];
        if (typeof reason !== 'string')
            throw new Error(`the delivery of ${effect} is exhausted with no reason (DOM-15)`);
        return { outcome, reason };
    }
    if (outcome === 'delivered') {
        return { outcome, said: 'returns' in answered ? { returns: answered['returns'] } : undefined };
    }
    throw new Error(`the delivery of ${effect} answered no outcome (DOM-15)`);
};
/** The entry an effect holds as a letter, named by the key (effect, id) (DOM-13). */
const is_the_entry = (a) => (b) => a.entry.effect === b.entry.effect && a.entry.id === b.entry.id;
/** The order an effect declares (D67.3, SC-56), as its component carries it: the order per resource unless it says `any`. */
const order_of = (effect) => typeof effect === 'object' && effect !== null && $Order in effect && effect[$Order] === 'any'
    ? 'any'
    : 'per_resource';
/**
 * Whether the entries an effect holds hold an entry that comes due (SC-53):
 * in the order per resource, one of them, a dead letter or an entry waiting,
 * shares a resource with it; an effect that tolerates reordering holds
 * nothing (SC-56).
 */
const holds = (order) => (held) => (queued) => order === 'per_resource' &&
    held.some((each) => share(each.entry.resources)(queued.entry.resources));
/**
 * The entries waiting that go on (SC-53): those `freed_in` gives, by their
 * entries' resources; in an effect that tolerates reordering, every one,
 * since its dead letters hold nothing (SC-56).
 */
const entries_freed_in = (order) => (held) => order === 'any'
    ? held.filter((each) => each.held === 'waiting')
    : freed_in((each) => each.entry.resources)(held);
/** The body of `effect_executor`, typed by what it meets at runtime. */
const runtime_executor = (executor) => {
    const path_of = paths_in(executor.registry);
    const effects = Object.entries(executor.registry).flatMap(([path, component]) => kind_of(component)?.kind === 'effect' ? [path] : []);
    // At wiring (CFG-2), every fault in one message: an effect whose entries
    // the store's versions do not read (DOM-22); a return use case that names
    // no effect it returns from, one of no effect of the registry, two returns
    // of one effect (DOM-13), one not in the registry.
    const faults = effects.flatMap((effect) => executor.versions[$Versions].reads(effect)
        ? []
        : [`${effect} is of no domain whose majors the versions were given (DOM-22)`]);
    const returns = Object.entries(executor.returns).flatMap(([name, use_case]) => {
        const path = path_of(use_case);
        const from = use_case[$UseCase].returns_from;
        const effect = from === undefined ? undefined : path_of(from);
        if (path === undefined) {
            faults.push(`the return ${name} is not in the registry given (DOM-24)`);
            return [];
        }
        if (effect === undefined || !effects.includes(effect)) {
            faults.push(`the return ${name} returns from no effect of the registry given (DOM-13)`);
            return [];
        }
        return [[effect, { name, use_case, path }]];
    });
    const returns_by_effect = new Map(returns);
    for (const [effect] of returns) {
        if (returns.filter(([other]) => other === effect).length > 1) {
            faults.push(`${effect} has two returns: one return per effect (DOM-13)`);
        }
    }
    if (faults.length > 0)
        throw new Error(`the effect executor: ${[...new Set(faults)].join('; ')}`);
    return (deliveries) => {
        const unknown_deliveries = Object.keys(deliveries).filter((path) => !effects.includes(path));
        const undelivered = effects.filter((effect) => typeof deliveries[effect] !== 'function');
        if (unknown_deliveries.length > 0 || undelivered.length > 0) {
            throw new Error(`the effect executor: ${[
                ...undelivered.map((effect) => `${effect} has no delivery (DOM-14)`),
                ...unknown_deliveries.map((path) => `${path} is delivered but is no effect of the registry`),
            ].join('; ')}`);
        }
        return (ports) => {
            // At wiring (CFG-2): every return's port, the library's, of that use case.
            const unwired = [...returns_by_effect.values()].filter((each) => served_by(ports.returns[each.name])?.component !== each.use_case);
            if (unwired.length > 0) {
                throw new Error(`the effect executor: ${unwired
                    .map((each) => `the port of ${each.name} is not the library's port of its use case`)
                    .join('; ')}`);
            }
            let stopping = false;
            let stop_now = () => undefined;
            const stopped = new Promise((resolve) => {
                stop_now = () => {
                    resolve('stopped');
                };
            });
            const fell = [];
            /** The context of a return: the clock's `now` and its zone, the entry's operation, correlation and fingerprint. */
            const context_of = (effect, returning, fields, said) => ({
                now: ports.clock.now(),
                time_zone: ports.clock.time_zone,
                operation: { scope: effect, id: operation_id.parse(fields.id) },
                correlation: fields.correlation,
                fingerprint: fingerprint_of({ path: returning.path, input: said }),
            });
            /** The return invoked with what the world said: nothing when it applied, else why it refused (DOM-15). */
            const returned = async (effect, returning, fields, said) => {
                const outcome = await outcome_of(called_with(ports.returns[returning.name], [
                    context_of(effect, returning, fields, said),
                    said,
                ]));
                if (!is_a_record(outcome))
                    throw new Error(`the return ${returning.name} gave no outcome`);
                switch (outcome['outcome']) {
                    case 'applied':
                        return undefined;
                    case 'rejected':
                        return {
                            cause: 'rejected',
                            returns: said,
                            failures: predicates_of(outcome['failures']),
                        };
                    case 'identity_already_used':
                        return { cause: 'identity_already_used', returns: said };
                    case 'invalid_request':
                        return { cause: 'invalid_request', returns: said };
                    default:
                        throw new Error(`the return ${returning.name} gave no outcome`);
                }
            };
            /**
             * An entry delivered (DOM-14, DOM-15): its payload at the current
             * shape; transient, tried again after a pause; exhausted, a dead
             * letter; delivered, its return, if any, with what the world said.
             * Nothing when it is handled, else the letter it becomes; `stopped`
             * when the executor is asked to stop while it pauses.
             */
            const delivered = async (queued, in_flight = false) => {
                const effect = queued.entry.effect;
                const fields = executor.versions[$Versions].entry(queued.entry);
                const returning = returns_by_effect.get(effect);
                const letter = (cause) => ({
                    position: queued.position,
                    entry: queued.entry,
                    held: 'dead_letter',
                    cause,
                });
                for (;;) {
                    const told = told_by(effect, await Promise.resolve(called_with(deliveries[effect], [{ id: fields.id, payload: fields.payload }])));
                    // A delivery in flight that answers once its executor is stopping
                    // was abandoned (F7, DOM-14): its answer is not read, and the
                    // executor started again meets it again.
                    if (in_flight && stopping)
                        return 'stopped';
                    if (told.outcome === 'transient') {
                        const woke = await Promise.race([
                            stopped,
                            ports.elapsed(retry_after).then(() => 'woken'),
                        ]);
                        if (woke === 'stopped')
                            return 'stopped';
                        continue;
                    }
                    if (told.outcome === 'exhausted') {
                        return letter({ cause: 'exhausted', reason: told.reason });
                    }
                    if (returning === undefined)
                        return 'handled';
                    if (told.said === undefined) {
                        throw new Error(`the delivery of ${effect} said nothing for its return (DOM-15)`);
                    }
                    const refused = await returned(effect, returning, fields, told.said.returns);
                    return refused === undefined ? 'handled' : letter(refused);
                }
            };
            /** The milliseconds until an instant, by the executor's clock: none or less when it has come. */
            const until = (instant) => instant === undefined ? 0 : Date.parse(instant) - Date.parse(ports.clock.now());
            // Each effect's unit, as an operator reaches it (SC-53).
            const { lanes, asked_on, served, close } = lanes_of(effects);
            /**
             * One effect's delivery, its own unit (D108): from its position, the
             * entries of the outbox, each delivered when due, the due ones in the
             * order of the outbox; one that comes due touching a resource the
             * effect holds held behind it (SC-53); the position advanced past
             * every entry handled, delivered or held, before the first one not
             * yet handled. Between two deliveries it serves what an operator asks
             * of its letters, then delivers the entries waiting that go on, before
             * those it meets. An effect whose order is `any` delivers its entries
             * in flight together, none waiting for another's end (F7, DOM-14):
             * the position stays behind the oldest delivery in flight, and a stop
             * abandons the deliveries in flight, which the executor started again
             * meets again.
             */
            const run = async (effect, lane) => {
                const order = order_of(executor.registry[effect]);
                const together = order === 'any';
                const from = await ports.state.position(effect);
                const outbox = ports.outbox(effect)(from)[Symbol.asyncIterator]();
                let next = outbox.next();
                let met = [];
                // The deliveries in flight of an effect `any`, by their entry: each
                // lands with its outcome, or with what it threw, never rejecting, so
                // that one abandoned by a stop or a fall throws to no one.
                const flights = new Map();
                /** An entry handled: the position advanced past every entry handled before the first one not yet handled. */
                const handled = async (queued) => {
                    met = met.map((each) => (each.queued === queued ? { ...each, handled: true } : each));
                    const open = met.findIndex((each) => !each.handled);
                    const passed = open === -1 ? met.length : open;
                    const last = met[passed - 1];
                    met = met.slice(passed);
                    if (last !== undefined)
                        await ports.state.advance(effect)(last.queued.position);
                };
                while (!stopping) {
                    const ask = lane.asked.shift();
                    if (ask !== undefined) {
                        await ask.serve();
                        continue;
                    }
                    const held = await ports.state.held(effect);
                    const going_on = entries_freed_in(order)(held);
                    const freed = going_on.find((each) => until(each.entry.not_before) <= 0);
                    if (freed !== undefined) {
                        const outcome = await delivered(freed);
                        if (outcome === 'stopped')
                            return;
                        await (outcome === 'handled' ? ports.state.release(freed) : ports.state.hold(outcome));
                        continue;
                    }
                    const due = met.find((each) => !each.handled &&
                        !flights.has(each.queued) &&
                        until(each.queued.entry.not_before) <= 0);
                    if (due !== undefined) {
                        const queued = due.queued;
                        // Met again after a fall, an entry the state holds is held once.
                        if (!held.some(is_the_entry(queued))) {
                            if (holds(order)(held)(queued)) {
                                await ports.state.hold({
                                    position: queued.position,
                                    entry: queued.entry,
                                    held: 'waiting',
                                });
                            }
                            else if (together) {
                                flights.set(queued, delivered(queued, true).then((outcome) => ({ landed: queued, outcome }), (error) => ({ landed: queued, threw: error })));
                                continue;
                            }
                            else {
                                const outcome = await delivered(queued);
                                if (outcome === 'stopped')
                                    return;
                                if (outcome !== 'handled')
                                    await ports.state.hold(outcome);
                            }
                        }
                        await handled(queued);
                        continue;
                    }
                    const waits = [
                        ...met.flatMap((each) => each.handled || flights.has(each.queued) ? [] : [each.queued.entry.not_before]),
                        ...going_on.map((each) => each.entry.not_before),
                    ].map(until);
                    // An operator who asked while the unit read its state is served first.
                    if (lane.asked.length > 0)
                        continue;
                    const woke = await Promise.race([
                        stopped,
                        asked_on(lane),
                        ...(waits.length === 0
                            ? []
                            : [ports.elapsed(Math.min(...waits)).then(() => 'woken')]),
                        ...(next === undefined ? [] : [next.then((arrived) => ({ arrived }))]),
                        ...flights.values(),
                    ]);
                    if (woke === 'stopped' || woke === 'woken' || woke === 'asked')
                        continue;
                    if ('landed' in woke) {
                        flights.delete(woke.landed);
                        if ('threw' in woke)
                            throw woke.threw;
                        if (woke.outcome === 'stopped')
                            return;
                        if (woke.outcome !== 'handled')
                            await ports.state.hold(woke.outcome);
                        await handled(woke.landed);
                        continue;
                    }
                    if (woke.arrived.done === true) {
                        next = undefined;
                        continue;
                    }
                    next = outbox.next();
                    // The position is inclusive: the entry at it was handled before.
                    if (woke.arrived.value.position !== from) {
                        met = [...met, { queued: woke.arrived.value, handled: false }];
                    }
                }
            };
            const runs = [...lanes].map(([effect, lane]) => run(effect, lane)
                .catch((error) => {
                fell.push(new Error(`the delivery of ${effect} fell`, { cause: error }));
            })
                .finally(() => {
                close(lane, fell.at(-1) ?? new Error('the effect executor is stopped'));
            }));
            /** The letter an effect holds by the key of one, as its state keeps it now: none if it is no longer a letter. */
            const letter_held = async (letter) => {
                const held = (await ports.state.held(letter.entry.effect)).find(is_the_entry(letter));
                return held?.held === 'dead_letter' ? held : undefined;
            };
            return {
                stop: async () => {
                    stopping = true;
                    stop_now();
                    await Promise.all(runs);
                    const first = fell[0];
                    if (first !== undefined)
                        throw first;
                },
                // An operator's redelivery of a letter (D67.3, D108.4), by its
                // effect's unit: exhausted, the effect again; refused, the return
                // again with what the world said, never the effect. Delivered, the
                // letter is released and the entries behind it go on; refused
                // again, it holds still, with what was said this time.
                redeliver: (letter) => served(letter.entry.effect, async () => {
                    const held = await letter_held(letter);
                    if (held === undefined)
                        return { outcome: 'not_held' };
                    const returning = returns_by_effect.get(held.entry.effect);
                    const outcome = held.cause.cause === 'exhausted' || returning === undefined
                        ? await delivered(held)
                        : await returned(held.entry.effect, returning, executor.versions[$Versions].entry(held.entry), held.cause.returns).then((refused) => refused === undefined ? 'handled' : { ...held, cause: refused });
                    if (outcome === 'stopped')
                        return { outcome: 'dead_letter', letter: held };
                    if (outcome === 'handled') {
                        await ports.state.release(held);
                        return { outcome: 'delivered' };
                    }
                    await ports.state.hold(outcome);
                    return { outcome: 'dead_letter', letter: outcome };
                }) ?? Promise.resolve({ outcome: 'not_held' }),
                // An operator lets a letter go, with a trace (D67.3): its entry never
                // delivered, the entries behind it go on as after a delivery.
                discard: (letter) => (trace) => served(letter.entry.effect, async () => {
                    const held = await letter_held(letter);
                    if (held === undefined)
                        return;
                    await ports.state.release(held);
                    await ports.state.discarded({
                        letter: held,
                        by: trace.by,
                        reason: trace.reason,
                        at: ports.clock.now(),
                    });
                }) ?? Promise.resolve(),
            };
        };
    };
};

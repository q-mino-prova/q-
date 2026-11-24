import { kind_of } from "./kind.js";
import { $Versions } from "./registry.js";
import { fingerprint_of, reaction_operation } from "./stable.js";
import { $Reaction, nothing } from "./reaction.js";
import { called, called_with, is_a_record, served_by } from "./runtime.js";
import { failures_of, freed_in, lanes_of, outcome_of, share } from "./consumer.js";
export function reaction_consumers(reactions) {
    return runtime_consumers(reactions);
}
/** A reaction's declaration as its component carries it (`$Reaction`): its fact, its use case, its translation. */
const declared_in = (reaction, component) => {
    const carried = typeof component === 'object' && component !== null && $Reaction in component
        ? component[$Reaction]
        : undefined;
    if (!is_a_record(carried) || !is_a_record(carried['declared']))
        throw new Error(`${reaction} carries no declaration (DOM-16)`);
    return {
        when: carried['when'],
        invokes: carried['invokes'],
        translation: carried['declared']['translation'],
    };
};
/** The part a reaction holds, named by its fact's operation and its position in the fact (SC-42). */
const is_the_part = (a) => (b) => a.reaction === b.reaction &&
    a.part === b.part &&
    a.fact.operation.scope === b.fact.operation.scope &&
    a.fact.operation.id === b.fact.operation.id;
/** The resources of a part a reaction meets or holds, as written with it (DOM-10). */
const resources_of = (each) => each.fact.parts[each.part]?.resources ?? [];
/** The body of `reaction_consumers`, typed by what it meets at runtime. */
const runtime_consumers = (reactions) => {
    const versions = reactions.versions[$Versions];
    // At wiring (CFG-2), every fault in one message: a reaction to a fact of
    // no domain whose majors the store's versions were given (DOM-22).
    const faults = [];
    const declared = Object.entries(reactions.registry).flatMap(([reaction, component]) => {
        if (kind_of(component)?.kind !== 'reaction')
            return [];
        const declaration = declared_in(reaction, component);
        const when = versions.path(declaration.when);
        if (when === undefined || !versions.reads(when)) {
            faults.push(`${reaction} reacts to a fact of no domain whose majors the versions were given (DOM-22)`);
            return [];
        }
        return [
            {
                reaction,
                when,
                translation: declaration.translation,
                use_case: declaration.invokes,
            },
        ];
    });
    if (faults.length > 0)
        throw new Error(`the consumers of the reactions: ${faults.join('; ')}`);
    return (wirings) => {
        // At wiring (CFG-2), every fault in one message: a reaction not wired, a
        // wiring of no reaction (the types say so too), a port that is not the
        // library's port of the use case the reaction invokes.
        const paths = declared.map((each) => each.reaction);
        const unwired = [
            ...paths.flatMap((path) => wirings[path] === undefined ? [`${path} is not wired (DOM-16)`] : []),
            ...Object.keys(wirings).flatMap((path) => paths.includes(path) ? [] : [`${path} is wired but is no reaction of the registry`]),
        ];
        const wired = declared.flatMap((each) => {
            const wiring = wirings[each.reaction];
            if (wiring === undefined)
                return [];
            const served = served_by(wiring.invokes);
            if (served === undefined || served.component !== each.use_case) {
                unwired.push(`the port ${each.reaction} invokes is not the library's port of its use case (DOM-16)`);
                return [];
            }
            return [{ ...each, log: wiring.log, port: wiring.invokes, invoked: served.path }];
        });
        if (unwired.length > 0)
            throw new Error(`the consumers of the reactions: ${unwired.join('; ')}`);
        return (ports) => {
            let stopping = false;
            let stop_now = () => undefined;
            const stopped = new Promise((resolve) => {
                stop_now = () => {
                    resolve('stopped');
                };
            });
            const fell = [];
            const by_path = new Map(wired.map((each) => [each.reaction, each]));
            /**
             * A part delivered (DOM-16): at the current shape, translated, and
             * the use case invoked under the reaction's operation; nothing to
             * invoke, or applied, it is handled; else the letter it becomes.
             */
            const delivered = async (each, part) => {
                const stored = part.fact.parts[part.part];
                if (stored === undefined)
                    throw new Error(`${each.reaction} met a part its fact has not (DOM-10)`);
                const input = called(each.translation, versions.part(stored).payload);
                if (input === nothing)
                    return 'handled';
                const context = {
                    now: ports.clock.now(),
                    time_zone: ports.clock.time_zone,
                    operation: reaction_operation(each.reaction)({
                        operation: part.fact.operation,
                        part: part.part,
                    }),
                    correlation: part.fact.correlation,
                    fingerprint: fingerprint_of({ path: each.invoked, input }),
                };
                const outcome = await outcome_of(called_with(each.port, [context, input]));
                if (!is_a_record(outcome))
                    throw new Error(`the use case ${each.reaction} invokes gave no outcome`);
                const letter = (cause) => ({
                    reaction: part.reaction,
                    position: part.position,
                    fact: part.fact,
                    part: part.part,
                    held: 'dead_letter',
                    cause,
                });
                switch (outcome['outcome']) {
                    case 'applied':
                        return 'handled';
                    case 'rejected':
                        return letter({ cause: 'rejected', failures: failures_of(outcome['failures']) });
                    case 'identity_already_used':
                        return letter({ cause: 'identity_already_used' });
                    case 'invalid_request':
                        return letter({ cause: 'invalid_request' });
                    default:
                        throw new Error(`the use case ${each.reaction} invokes gave no outcome`);
                }
            };
            /**
             * A fact met (DOM-16, SC-42): each part of the reaction's path, in
             * order; one the state holds, held once; one that touches a resource
             * the reaction holds, held behind it; any other delivered, a letter
             * held if refused.
             */
            const met = async (each, event) => {
                for (const [index, stored] of event.fact.parts.entries()) {
                    if (stored.path !== each.when)
                        continue;
                    const part = {
                        reaction: each.reaction,
                        position: event.position,
                        fact: event.fact,
                        part: index,
                    };
                    const held = await ports.state.held(each.reaction);
                    if (held.some(is_the_part(part)))
                        continue;
                    if (held.some((one) => share(resources_of(one))(stored.resources))) {
                        await ports.state.hold({ ...part, held: 'waiting' });
                        continue;
                    }
                    const outcome = await delivered(each, part);
                    if (outcome !== 'handled')
                        await ports.state.hold(outcome);
                }
            };
            const { lanes, asked_on, served, close } = lanes_of(paths);
            /**
             * One reaction's delivery, its own unit (D89.6): from its position,
             * the facts of its log, each met then the position advanced past it.
             * Between two facts it serves what an operator asks of its letters,
             * then delivers the parts waiting that go on, before the facts it
             * meets.
             */
            const run = async (each, lane) => {
                const from = await ports.state.position(each.reaction);
                const log = each.log(from)[Symbol.asyncIterator]();
                let next = log.next();
                while (!stopping) {
                    const ask = lane.asked.shift();
                    if (ask !== undefined) {
                        await ask.serve();
                        continue;
                    }
                    const freed = freed_in(resources_of)(await ports.state.held(each.reaction))[0];
                    if (freed !== undefined) {
                        const outcome = await delivered(each, freed);
                        await (outcome === 'handled' ? ports.state.release(freed) : ports.state.hold(outcome));
                        continue;
                    }
                    // An operator who asked while the unit read its state is served first.
                    if (lane.asked.length > 0)
                        continue;
                    const woke = await Promise.race([
                        stopped,
                        asked_on(lane),
                        ...(next === undefined ? [] : [next.then((arrived) => ({ arrived }))]),
                    ]);
                    if (woke === 'stopped' || woke === 'asked')
                        continue;
                    if (woke.arrived.done === true) {
                        next = undefined;
                        continue;
                    }
                    next = log.next();
                    const event = woke.arrived.value;
                    if (event.event === 'caught_up')
                        continue;
                    if (event.event === 'position_unavailable') {
                        throw new Error(`the log keeps the position of ${each.reaction} no longer (DOM-17)`);
                    }
                    // The position is inclusive: the fact at it was handled before.
                    if (event.position === from)
                        continue;
                    await met(each, event);
                    await ports.state.advance(each.reaction)(event.position);
                }
            };
            const runs = wired.map((each) => {
                const lane = lanes.get(each.reaction);
                if (lane === undefined)
                    throw new Error(`${each.reaction} has no unit`);
                return run(each, lane)
                    .catch((error) => {
                    fell.push(new Error(`the delivery of ${each.reaction} fell`, { cause: error }));
                })
                    .finally(() => {
                    close(lane, fell.at(-1) ?? new Error('the consumers of the reactions are stopped'));
                });
            });
            /** The letter a reaction holds by the key of one, as its state keeps it now: none if it is no longer a letter. */
            const letter_held = async (letter) => {
                const held = (await ports.state.held(letter.reaction)).find(is_the_part(letter));
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
                // An operator's redelivery of a letter (D67.3), by its reaction's
                // unit: the part again, with the same operation, after a fix.
                // Delivered, the letter is released and the parts behind it go on;
                // refused again, it holds still, with why this time.
                redeliver: (letter) => served(letter.reaction, async () => {
                    const held = await letter_held(letter);
                    const each = by_path.get(letter.reaction);
                    if (held === undefined || each === undefined)
                        return { outcome: 'not_held' };
                    const outcome = await delivered(each, held);
                    if (outcome === 'handled') {
                        await ports.state.release(held);
                        return { outcome: 'delivered' };
                    }
                    await ports.state.hold(outcome);
                    return { outcome: 'dead_letter', letter: outcome };
                }) ?? Promise.resolve({ outcome: 'not_held' }),
                // An operator lets a letter go, with a trace (D67.3): its part never
                // delivered, the parts behind it go on as after a delivery.
                discard: (letter) => (trace) => served(letter.reaction, async () => {
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

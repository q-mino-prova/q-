// The cell of q-'s oracle (TST-2, V10): where the in-memory state adapter
// keeps the state of every domain of a node and its facts, one command at a
// time (DOM-9). A port, so that a test can look at it, and so that the
// deviations a stream and an executor must bear are injected (TST-4): a
// position it keeps no longer (`forget`), every fact and every entry given
// twice (`redelivered`). On the model of Shed's (`test/shed/scenarios/oracle.ts`).
import * as zz from '@q-mino/domains/library';
/**
 * The cell of a node with more domains, as one domain's module sees it
 * (MBX-7): the state of the node, read as its domain's part of it; a step
 * recorded over the part, the rest of the node's state kept as it is. The
 * phone's, whose cell holds `bonds` and `seals` (part 11.3).
 */
export const seen_by = (cell) => ({
    get: cell.get,
    record: (step) => {
        cell.record({ ...step, state: { ...cell.get(), ...step.state } });
    },
    position: cell.position,
    recorded_by: cell.recorded_by,
    history: cell.history,
    after: cell.after,
});
/** The position of the fact recorded after so many, the first at 1. */
export const position_at = (count) => zz.position.parse(String(count));
/**
 * A new cell (TST-2): the facts it records in order, each at its position,
 * with the state before and after it; the executor's state kept across a
 * fall, so that an executor started again finds its positions and letters;
 * the reactions' consumers' likewise, on the model of Shed's.
 */
export const cell = (making) => {
    let state = making.initial;
    const redelivered = making.redelivered ?? false;
    const recorded = [];
    const entries = [];
    const waiting = [];
    const trace = [];
    let kept_from = 0;
    const delivered = (given) => redelivered ? given.flatMap((one) => [one, one]) : given;
    const after = (position) => delivered(recorded.filter((each) => Number(each.position) > Number(position)));
    const positions = new Map();
    let holding = [];
    const same_entry = (a) => (b) => a.entry.effect === b.entry.effect && a.entry.id === b.entry.id;
    const executor = {
        position: (effect) => Promise.resolve(positions.get(effect)),
        advance: (effect) => (to) => {
            positions.set(effect, to);
            return Promise.resolve();
        },
        held: (effect) => Promise.resolve(holding.filter((each) => each.entry.effect === effect)),
        hold: (entry) => {
            holding = (holding.some(same_entry(entry))
                ? holding.map((each) => (same_entry(entry)(each) ? entry : each))
                : [...holding, entry]).toSorted((a, b) => Number(a.position) - Number(b.position));
            return Promise.resolve();
        },
        release: (entry) => {
            holding = holding.filter((each) => !same_entry(entry)(each));
            return Promise.resolve();
        },
        discarded: () => Promise.resolve(),
    };
    const reaction_positions = new Map();
    let parts_held = [];
    const same_part = (a) => (b) => a.reaction === b.reaction &&
        a.part === b.part &&
        a.fact.operation.scope === b.fact.operation.scope &&
        a.fact.operation.id === b.fact.operation.id;
    const reactions = {
        position: (reaction) => Promise.resolve(reaction_positions.get(reaction)),
        advance: (reaction) => (to) => {
            reaction_positions.set(reaction, to);
            return Promise.resolve();
        },
        held: (reaction) => Promise.resolve(parts_held.filter((each) => each.reaction === reaction)),
        hold: (part) => {
            parts_held = (parts_held.some(same_part(part))
                ? parts_held.map((each) => (same_part(part)(each) ? part : each))
                : [...parts_held, part]).toSorted((a, b) => Number(a.position) - Number(b.position) || a.part - b.part);
            return Promise.resolve();
        },
        release: (part) => {
            parts_held = parts_held.filter((each) => !same_part(part)(each));
            return Promise.resolve();
        },
        discarded: () => Promise.resolve(),
    };
    const stored = () => {
        const all = [
            ...recorded.flatMap((each) => each.fact.parts.map((part) => ({ path: part.path, version: part.version }))),
            ...entries.map((entry) => ({ path: entry.effect, version: entry.version })),
        ];
        return all.filter((each, i) => all.findIndex((other) => other.path === each.path && other.version === each.version) === i);
    };
    return {
        get: () => state,
        record: (step) => {
            recorded.push({
                position: position_at(recorded.length + 1),
                fact: step.fact,
                before: state,
                after: step.state,
            });
            entries.push(...step.entries);
            state = step.state;
            for (const wake of waiting.splice(0))
                wake();
        },
        position: () => position_at(recorded.length),
        history: (from) => (from === undefined ? 1 : Number(from)) < kept_from
            ? { history: 'forgotten' }
            : {
                history: 'kept',
                recorded: delivered(recorded.filter((each) => from === undefined || Number(each.position) >= Number(from))),
                position: position_at(recorded.length),
            },
        after: (position) => after(position).length > 0
            ? Promise.resolve(after(position))
            : new Promise((resolve) => {
                waiting.push(() => {
                    resolve(after(position));
                });
            }),
        recorded_by: (operation) => recorded.find((each) => each.fact.operation.id === operation.id && each.fact.operation.scope === operation.scope),
        outbox: (effect) => (from) => ({
            [Symbol.asyncIterator]: () => {
                let index = from === undefined ? 0 : Number(from) - 1;
                let again = undefined;
                const next = async () => {
                    if (again !== undefined) {
                        const value = again;
                        again = undefined;
                        return { done: false, value };
                    }
                    for (;;) {
                        const entry = entries[index];
                        if (entry === undefined) {
                            await new Promise((wake) => {
                                waiting.push(wake);
                            });
                            continue;
                        }
                        index += 1;
                        if (entry.effect !== effect)
                            continue;
                        const value = { position: position_at(index), entry };
                        if (redelivered)
                            again = value;
                        return { done: false, value };
                    }
                };
                return { next };
            },
        }),
        stored_versions: () => Promise.resolve(stored()),
        executor,
        reactions,
        trace: (traced) => {
            trace.push(traced);
        },
        entries: () => entries,
        forget: (before) => {
            kept_from = Number(before);
        },
        traced: () => [...trace],
        held: () => [...holding],
        held_parts: () => [...parts_held],
    };
};

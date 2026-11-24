import * as zz from '@q-mino/domains/library';
import { z } from 'zod';
/** A count as twelve digits: the order of the keys is the order of the counts. */
const padded = (count) => String(count).padStart(12, '0');
/** The keys of the partition. */
const keys = {
    facts: 'meta/facts',
    entries: 'meta/entries',
    fact: (position) => `fact/${position}`,
    operation: (operation) => `operation/${JSON.stringify([operation.scope, operation.id])}`,
    entries_of: (effect) => `entry/${effect}/`,
    executor_position: (effect) => `executor/position/${effect}`,
    held_of: (effect) => `executor/held/${effect}/`,
    version: (stored) => `version/${JSON.stringify([stored.path, stored.version])}`,
};
/** The range of the keys under a prefix that ends with `/`: from it, before its successor (EXT-14). */
const under = (prefix, from) => ({
    read: 'range',
    from: from ?? prefix,
    before: `${prefix.slice(0, -1)}0`,
});
/**
 * What this adapter committed, read back as its type, by the kind of its
 * key: the partition holds at each key only what this adapter wrote there
 * (EXT-14: the kernel carries it, never writes it), as JSON.
 */
const kept = {
    fact: (value) => value, // cast: a `fact/` key holds a fact as this adapter stored it (EXT-14)
    entry: (value) => value, // cast: an `entry/` key holds an outbox entry as this adapter stored it (EXT-14)
    held: (value) => value, // cast: an `executor/held/` key holds a held entry as this adapter stored it (EXT-14)
};
/** A count kept at a key; none is zero. */
const count = (value) => (typeof value === 'number' ? value : 0);
/** A path and a version as a key names them. */
const stored_version = z.tuple([z.string(), zz.semver]);
/** The name of an executor's letter: its effect's path and its entry's id (EXT-2). */
export const the_name_of_a_letter = (entry) => `${entry.entry.effect}/${entry.entry.id}`;
/**
 * The adapter over a partition: its command adapter's parts (`algebra`,
 * `execute`, `recorded`, with the business's fragments and writes), its
 * fact log, its outbox, its executor's state, the versions it keeps.
 */
export const a_partition = (storage) => {
    /** Some keys read: the values present. A refusal is a technical outcome, thrown (DOM-15). */
    const read = async (asked) => {
        const answer = await storage.read(asked);
        if (answer.answer === 'refused')
            throw new Error(`its storage refused a read: ${answer.why}`);
        return answer.entries;
    };
    const values_at = async (asked) => new Map((await read({ read: 'keys', keys: asked })).map((entry) => [entry.key, entry.value]));
    /** A batch committed, all or none. A refusal is a technical outcome, thrown (DOM-15). */
    const commit = async (writes) => {
        const answer = await storage.commit(writes);
        if (answer.answer === 'refused')
            throw new Error(`its storage refused a commit: ${answer.why}`);
    };
    // One writer (DOM-9): the commands run one at a time; the outbox and the
    // log wait for the next commit, counted, so that one landing while they
    // read is not missed.
    let turn = Promise.resolve();
    const serially = (step) => {
        const run = turn.then(step, step);
        turn = run.catch(() => undefined);
        return run;
    };
    let commits = 0;
    let waiting = [];
    const committed = () => {
        commits += 1;
        const woken = waiting;
        waiting = [];
        for (const wake of woken)
            wake();
    };
    const a_commit_after = (seen) => commits > seen
        ? Promise.resolve()
        : new Promise((wake) => {
            waiting.push(wake);
        });
    const recorded = async (operation) => {
        const found = (await values_at([keys.operation(operation)])).get(keys.operation(operation));
        if (typeof found !== 'string')
            return undefined;
        const fact = (await values_at([keys.fact(found)])).get(keys.fact(found));
        return fact === undefined
            ? undefined
            : { outcome: 'recorded', position: zz.position.parse(found), fact: kept.fact(fact) };
    };
    const execute = (plan) => serially(async () => {
        const already = await recorded(plan.operation);
        if (already !== undefined)
            return already;
        const branches = plan.branches.map((branch) => {
            if ('elements' in branch)
                throw new Error('a branch over a list comes with its case (SC-54)');
            return branch;
        });
        const values = await values_at([
            ...new Set([
                keys.facts,
                keys.entries,
                ...branches.flatMap((branch) => [
                    ...branch.condition.reads,
                    ...branch.leaves.flatMap((leaf) => leaf.reads),
                    ...branch.writes.flatMap((write) => write.reads),
                ]),
            ]),
        ]);
        const seen = (key) => values.get(key);
        const applied = branches.findIndex((branch) => branch.condition.holds(seen));
        const branch = branches[applied];
        if (branch === undefined) {
            return {
                outcome: 'rejected',
                leaves: branches.map((each) => each.leaves.map((leaf) => leaf.holds(seen))),
            };
        }
        // Each part's writes see those before it (DOM-10).
        const after = new Map(values);
        const writes = branch.writes.flatMap((write) => {
            const made = write.writes((key) => after.get(key));
            for (const each of made) {
                if (each.write === 'set')
                    after.set(each.key, each.value);
                else
                    after.delete(each.key);
            }
            return made;
        });
        const facts = count(values.get(keys.facts)) + 1;
        const position = padded(facts);
        const entries = count(values.get(keys.entries));
        const versions = [
            ...branch.fact.parts.map((part) => ({ path: part.path, version: part.version })),
            ...branch.entries.map((entry) => ({ path: entry.effect, version: entry.version })),
        ];
        await commit([
            ...writes,
            { write: 'set', key: keys.fact(position), value: zz.as_json(branch.fact) },
            { write: 'set', key: keys.operation(plan.operation), value: position },
            ...branch.entries.map((entry, index) => ({
                write: 'set',
                key: `${keys.entries_of(entry.effect)}${padded(entries + index + 1)}`,
                value: zz.as_json(entry),
            })),
            ...[...new Set(versions.map(keys.version))].map((key) => ({
                write: 'set',
                key,
                value: true,
            })),
            { write: 'set', key: keys.facts, value: facts },
            { write: 'set', key: keys.entries, value: entries + branch.entries.length },
        ]);
        committed();
        return {
            outcome: 'applied',
            branch: applied,
            elements: [],
            position: zz.position.parse(position),
        };
    });
    /** The conditions of the business over the partition (AND, OR, NOT), and its predicates' fragments. */
    const algebra = (predicate) => ({
        predicate,
        and: (components) => ({
            reads: components.flatMap((component) => component.reads),
            holds: (seen) => components.every((component) => component.holds(seen)),
        }),
        or: (components) => ({
            reads: components.flatMap((component) => component.reads),
            holds: (seen) => components.some((component) => component.holds(seen)),
        }),
        not: (operand) => ({
            reads: operand.reads,
            holds: (seen) => !operand.holds(seen),
        }),
    });
    /** Entries under a prefix from a key on, inclusive, then each new one as it is committed: a key and its value. */
    const from_on = (prefix, from) => ({
        async *[Symbol.asyncIterator]() {
            let next = from === undefined ? undefined : `${prefix}${from}`;
            for (;;) {
                const seen = commits;
                const listed = await read(under(prefix, next));
                for (const entry of listed)
                    yield entry;
                const last = listed.at(-1);
                if (last !== undefined)
                    next = `${prefix}${padded(Number(last.key.slice(prefix.length)) + 1)}`;
                else
                    await a_commit_after(seen);
            }
        },
    });
    /** The outbox, effect by effect (DOM-14): its entries from a position on, inclusive, then each new one. */
    const outbox = (effect) => (from) => ({
        async *[Symbol.asyncIterator]() {
            for await (const entry of from_on(keys.entries_of(effect), from)) {
                yield {
                    position: zz.position.parse(entry.key.slice(keys.entries_of(effect).length)),
                    entry: kept.entry(entry.value),
                };
            }
        },
    });
    /** The fact log (DOM-17): the facts kept from a position on, then "caught up", then each new one. */
    const log = (from) => ({
        async *[Symbol.asyncIterator]() {
            const kept_now = await read(under('fact/', from === undefined ? undefined : keys.fact(from)));
            for (const entry of kept_now) {
                yield {
                    event: 'fact',
                    position: zz.position.parse(entry.key.slice('fact/'.length)),
                    fact: kept.fact(entry.value),
                };
            }
            const last = kept_now.at(-1)?.key.slice('fact/'.length);
            yield {
                event: 'caught_up',
                position: zz.position.parse(last ?? padded(Number(from ?? '1') - 1)),
            };
            for await (const entry of from_on('fact/', last === undefined ? from : padded(Number(last) + 1))) {
                yield {
                    event: 'fact',
                    position: zz.position.parse(entry.key.slice('fact/'.length)),
                    fact: kept.fact(entry.value),
                };
            }
        },
    });
    /**
     * The executor's state (DOM-14), kept in the partition so that an executor
     * started again finds its positions and its letters; its dead letters told
     * to the kernel as they are held, and as they are let go (EXT-2, F6).
     */
    const executor = (notices) => ({
        position: async (effect) => {
            const found = (await values_at([keys.executor_position(effect)])).get(keys.executor_position(effect));
            return typeof found === 'string' ? zz.position.parse(found) : undefined;
        },
        advance: (effect) => async (to) => {
            await commit([{ write: 'set', key: keys.executor_position(effect), value: to }]);
        },
        held: async (effect) => (await read(under(keys.held_of(effect)))).map((entry) => kept.held(entry.value)),
        hold: async (entry) => {
            await commit([
                {
                    write: 'set',
                    key: `${keys.held_of(entry.entry.effect)}${entry.position}`,
                    value: zz.as_json(entry),
                },
            ]);
            if (entry.held === 'dead_letter') {
                notices.dead_letter({
                    letter: the_name_of_a_letter(entry),
                    of: 'an_effect',
                    path: entry.entry.effect,
                    entry: entry.entry,
                    cause: entry.cause,
                });
            }
        },
        release: async (entry) => {
            const key = `${keys.held_of(entry.entry.effect)}${entry.position}`;
            const was = (await values_at([key])).get(key);
            await commit([{ write: 'delete', key }]);
            if (was !== undefined && kept.held(was).held === 'dead_letter') {
                notices.released(the_name_of_a_letter(entry));
            }
        },
        discarded: () => Promise.resolve(),
    });
    /** The paths and versions its facts and entries were written at (DOM-22). */
    const stored_versions = async () => (await read(under('version/'))).map((entry) => {
        const [path, version] = stored_version.parse(JSON.parse(entry.key.slice('version/'.length)));
        return { path, version };
    });
    return { algebra, execute, recorded, log, outbox, executor, stored_versions };
};

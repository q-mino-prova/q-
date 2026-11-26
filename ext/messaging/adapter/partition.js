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
    discarded_of: (effect) => `executor/discarded/${effect}/`,
    version: (stored) => `version/${JSON.stringify([stored.path, stored.version])}`,
};
/** The range of the keys under a prefix that ends with `/`: from it, before its successor (EXT-14). */
export const under = (prefix, from) => ({
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
/** The keys under which the executor keeps the letters of an effect it holds, and those discarded (MSG-13). */
export const the_executor_s = {
    held: keys.held_of,
    discarded: keys.discarded_of,
};
/** The entry's id a held letter keeps, as this adapter stored it, and whether it is a dead letter (MSG-13). */
export const the_entry_of_a_held = (value) => {
    const held = kept.held(value);
    return { id: held.entry.id, dead: held.held === 'dead_letter' };
};
/** AND, OR, NOT over the selections of one subject (LIB-7): AND within any of its components' ranges, OR within all of them, NOT within none it can tell. */
export const selection_operators = () => ({
    and: (components) => {
        const within = components.find((component) => component.within !== undefined)?.within;
        return {
            ...(within === undefined ? {} : { within }),
            keeps: (records) => (candidate) => components.every((component) => component.keeps(records)(candidate)),
        };
    },
    or: (components) => {
        const every = components.every((component) => component.within !== undefined);
        return {
            ...(every ? { within: components.flatMap((component) => component.within ?? []) } : {}),
            keeps: (records) => (candidate) => components.some((component) => component.keeps(records)(candidate)),
        };
    },
    not: (operand) => ({
        keeps: (records) => (candidate) => !operand.keeps(records)(candidate),
    }),
});
const code_points = (text) => Array.from(text, (character) => character.codePointAt(0) ?? 0);
/** Text by Unicode code point, no collation (LIB-9). */
const compare_texts = (a, b) => {
    const x = code_points(a);
    const y = code_points(b);
    const first_difference = x.findIndex((point, i) => point !== y[i]);
    return first_difference === -1
        ? x.length - y.length
        : (x[first_difference] ?? 0) - (y[first_difference] ?? Number.NEGATIVE_INFINITY);
};
/** LIB-9's value order, as the oracle writes it: an absent value after any value, false before true, numbers by value, text by code point. */
const compare_values = (a, b) => a === undefined || a === null
    ? b === undefined || b === null
        ? 0
        : 1
    : b === undefined || b === null
        ? -1
        : typeof a === 'string' && typeof b === 'string'
            ? compare_texts(a, b)
            : typeof a === 'number' && typeof b === 'number'
                ? a - b
                : typeof a === 'boolean' && typeof b === 'boolean'
                    ? Number(a) - Number(b)
                    : 0;
/** The comparison with a page's cursor (SC-22): a candidate after the order key. */
export const after = (key) => ({
    keeps: () => (candidate) => (key
        .map(({ field, direction, value }) => (direction === 'ascending' ? 1 : -1) * compare_values(field(candidate), value))
        .find((comparison) => comparison !== 0) ?? 0) > 0,
});
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
        discarded: async (trace) => {
            await commit([
                {
                    write: 'set',
                    key: `${keys.discarded_of(trace.letter.entry.effect)}${encodeURIComponent(trace.letter.entry.id)}`,
                    value: zz.as_json({ by: trace.by, reason: trace.reason }),
                },
            ]);
        },
    });
    /** The paths and versions its facts and entries were written at (DOM-22). */
    const stored_versions = async () => (await read(under('version/'))).map((entry) => {
        const [path, version] = stored_version.parse(JSON.parse(entry.key.slice('version/'.length)));
        return { path, version };
    });
    /**
     * The entries of a planned query, read between two commands (D66): the
     * ranges its selection narrows it to (or its source's), and those it reads
     * besides; its candidates kept by the selection, in the order (the
     * identity closes it), read field by field; with the position of the last
     * fact, at most `limit` of those a page's selection keeps, and the total.
     */
    const in_a_snapshot = (plan, page) => serially(async () => {
        const within = plan.selection.within ?? plan.from.under;
        const prefixes = [...new Set([...within, ...plan.from.besides])];
        const [values, ...ranges] = await Promise.all([
            values_at([keys.facts]),
            ...prefixes.map((prefix) => read(under(prefix))),
        ]);
        const by_prefix = new Map(prefixes.map((prefix, at) => [prefix, ranges[at] ?? []]));
        const records = (prefix) => by_prefix.get(prefix) ?? [];
        const candidates = plan.from.candidates(records, within);
        const order = plan.order.map(([field, direction]) => {
            const sign = direction === 'ascending' ? 1 : -1;
            return (a, b) => sign * compare_values(field(a), field(b));
        });
        const entries_of = (selection) => candidates
            .filter(selection.keeps(records))
            .toSorted((a, b) => order.reduce((result, by) => (result !== 0 ? result : by(a, b)), 0))
            .map((candidate) => Object.fromEntries(Object.entries(plan.fields).map(([name, field]) => [name, field(candidate)])));
        return {
            entries: entries_of(page.selection).slice(0, page.limit),
            total: entries_of(plan.selection).length,
            position: zz.position.parse(padded(count(values.get(keys.facts)))),
        };
    });
    /** The reads of its queries (DOM-18, SC-22): whole, or a page with its total. */
    const reads = {
        read: async (plan) => {
            const { entries, position } = await in_a_snapshot(plan, { selection: plan.selection });
            return { entries, position };
        },
        page: (plan) => in_a_snapshot(plan, {
            selection: plan.page,
            ...(plan.limit === undefined ? {} : { limit: plan.limit }),
        }),
    };
    return { algebra, execute, recorded, log, outbox, executor, stored_versions, reads };
};

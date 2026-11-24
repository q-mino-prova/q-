// A business domain's command port on IndexedDB (DOM-8, DOM-9, DOM-11,
// WEB-9): the library's `Execute` and `RecordedBy` over the domain's store.
// A fragment and a write declare the keys they read, as the partition-backed
// adapter of an extension (EXT-14), and decide on them synchronously, by type:
// so a command is one transaction, which reads the writer's term, its
// operation and every key its branches name, decides, and writes its fact,
// its operation, its entries, its versions and its parts' writes, awaiting
// nothing but its own requests (WEB-9). IndexedDB runs the writer's
// transactions one after another, since each holds the node's store.
import * as zz from '@q-mino/domains/library';
import { the_name_of, the_node_s_store } from "./database.js";
import { the_end_of, the_record_of, the_records_of, the_result_of } from "./requests.js";
import { the_term_holds } from "./the_writer.js";
/** The boolean operators over fragments (LIB-7): the keys of each, the value of all. */
export const the_operators = {
    and: (components) => ({
        reads: components.flatMap((component) => component.reads),
        holds: (records) => components.every((component) => component.holds(records)),
    }),
    or: (components) => ({
        reads: components.flatMap((component) => component.reads),
        holds: (records) => components.some((component) => component.holds(records)),
    }),
    not: (operand) => ({ reads: operand.reads, holds: (records) => !operand.holds(records) }),
};
/** The keys of a domain's store kept by the adapter, beside its business's `state` records. */
export const the_keys = {
    fact: (position) => ['fact', position],
    operation: (operation) => ['operation', operation.scope, operation.id],
    entry: (effect, position) => ['entry', effect, position],
    version: (path, version) => ['version', path, version],
};
/** The node's counters in its store: the last fact's position, the last entry's (one order each). */
const the_last_fact = 'the_last_fact';
const the_last_entry = 'the_last_entry';
const a_count = (value) => (typeof value === 'number' ? value : 0);
const the_text_of = (read) => 'key' in read ? JSON.stringify([read.store, read.key]) : JSON.stringify([read.store, read.prefix]);
/** IndexedDB's range of a prefix: every array key that begins with it (an id is never an array). */
export const the_range_of = (key_range, prefix) => key_range.bound([...prefix], [...prefix, []], false, true);
/** Whether a key begins with a prefix, part by part. */
const begins_with = (key, prefix) => Array.isArray(key) && prefix.every((part, at) => JSON.stringify(key[at]) === JSON.stringify(part));
const the_reads_of = (branch) => [
    ...branch.condition.reads,
    ...branch.leaves.flatMap((leaf) => leaf.reads),
    ...('elements' in branch
        ? branch.elements.flatMap((element) => element.flatMap((each) => [
            ...each.condition.reads,
            ...each.leaves.flatMap((l) => l.reads),
        ]))
        : branch.writes.flatMap((write) => write.reads)),
];
/** Reads every key and range named, each once, in the transaction. */
export const read_in = async (transaction, key_range, reads) => {
    const unique = [...new Map(reads.map((read) => [the_text_of(read), read])).values()];
    const values = await Promise.all(unique.map(async (read) => {
        const store = transaction.objectStore(read.store);
        if ('key' in read)
            return the_record_of(store.get(read.key));
        const range = the_range_of(key_range, read.prefix);
        const [keys, kept] = await Promise.all([
            the_result_of(store.getAllKeys(range)),
            the_records_of(store.getAll(range)),
        ]);
        return keys.map((key, at) => ({ key, value: kept[at] }));
    }));
    const found = new Map(unique.map((read, at) => [the_text_of(read), values[at]]));
    const kept_under = (range) => {
        const given = found.get(the_text_of(range));
        if (!Array.isArray(given))
            throw new Error(`a range not read: ${the_text_of(range)}`);
        // cast: the list `read_in` built above for this range, of `AKept`
        return given;
    };
    return {
        of: (key) => found.get(the_text_of(key)),
        all: (range) => kept_under(range).map((kept) => kept.value),
        kept_under,
    };
};
/** The records a command reads, its writes laid over them as they are made (DOM-10). */
const laid_over = (read, store, after) => ({
    of: (key) => {
        const written = key.store === store ? after.get(JSON.stringify(key.key)) : undefined;
        return written === undefined ? read.of(key) : written.value;
    },
    all: (range) => {
        const before = read.kept_under(range);
        if (range.store !== store)
            return before.map((kept) => kept.value);
        const under = [...after.values()].filter((kept) => begins_with(kept.key, range.prefix));
        const changed = new Set(under.map((kept) => JSON.stringify(kept.key)));
        return [
            ...before.filter((kept) => !changed.has(JSON.stringify(kept.key))),
            ...under.filter((kept) => kept.value !== undefined),
        ].map((kept) => kept.value);
    },
});
const the_fact_recorded = async (records, operation) => {
    const position = await the_record_of(records.get(the_keys.operation(operation)));
    if (typeof position !== 'number')
        return undefined;
    const fact = await the_record_of(records.get(the_keys.fact(position)));
    return {
        outcome: 'recorded',
        position: zz.position.parse(String(position)),
        // cast: the adapter's own record, written under the fact's key by `execute_in` below
        fact: fact,
    };
};
/** Reads the fact an operation recorded, if any, outside a command (DOM-11: the leaf's and the port's lookups). */
export const recorded_in = (domain) => (operation) => {
    const store = the_name_of({ of: 'a_domain', path: domain.path });
    return the_fact_recorded(domain.database.transaction(store, 'readonly').objectStore(store), operation);
};
const the_leaves_of = (branch, records) => [
    ...branch.leaves.map((leaf) => leaf.holds(records)),
    ...('elements' in branch
        ? branch.elements.flatMap((element) => element.flatMap((each) => each.leaves.map((leaf) => leaf.holds(records))))
        : []),
];
/** A business domain's `Execute`: one transaction per command (DOM-8, DOM-9, DOM-11, WEB-9). */
export const execute_in = (domain) => async (plan) => {
    const store = the_name_of({ of: 'a_domain', path: domain.path });
    const node = (key) => ({ store: the_node_s_store, key });
    const reads = [
        node(the_last_fact),
        node(the_last_entry),
        ...plan.branches.flatMap(the_reads_of),
    ];
    const stores = [...new Set([store, the_node_s_store, ...reads.map((key) => key.store)])];
    const transaction = domain.database.transaction(stores, 'readwrite');
    const ended = the_end_of(transaction);
    const kept = transaction.objectStore(store);
    try {
        await the_term_holds(transaction, domain.term);
        const recorded = await the_fact_recorded(kept, plan.operation);
        if (recorded !== undefined) {
            await ended;
            return recorded;
        }
        const records = await read_in(transaction, domain.key_range, reads);
        const chosen = (branch) => 'elements' in branch
            ? branch.elements.map((element) => element.findIndex((each) => each.condition.holds(records)))
            : [];
        const applied = plan.branches.findIndex((branch) => branch.condition.holds(records) && chosen(branch).every((index) => index !== -1));
        const branch = plan.branches[applied];
        if (branch === undefined) {
            await ended;
            return {
                outcome: 'rejected',
                leaves: plan.branches.map((planned) => the_leaves_of(planned, records)),
            };
        }
        const elements = chosen(branch);
        const write = 'elements' in branch ? branch.applies(elements) : branch;
        const more = 'elements' in branch
            ? await read_in(transaction, domain.key_range, write.writes.flatMap((each) => each.reads))
            : records;
        const position = a_count(records.of(node(the_last_fact))) + 1;
        const first_entry = a_count(records.of(node(the_last_entry))) + 1;
        const recording = { position: zz.position.parse(String(position)) };
        const after = new Map();
        const seen = laid_over(more, store, after);
        for (const each of write.writes)
            for (const put of each.puts(seen, recording)) {
                after.set(JSON.stringify(put.key), {
                    key: put.key,
                    value: put.put === 'set' ? put.value : undefined,
                });
                if (put.put === 'set')
                    kept.put(put.value, put.key);
                else
                    kept.delete(put.key);
            }
        kept.put(write.fact, the_keys.fact(position));
        kept.put(position, the_keys.operation(plan.operation));
        for (const part of write.fact.parts)
            kept.put(true, the_keys.version(part.path, part.version));
        write.entries.forEach((entry, at) => {
            kept.put(entry, the_keys.entry(entry.effect, first_entry + at));
            kept.put(true, the_keys.version(entry.effect, entry.version));
        });
        const counts = transaction.objectStore(the_node_s_store);
        counts.put(position, the_last_fact);
        counts.put(first_entry + write.entries.length - 1, the_last_entry);
        await ended;
        domain.committed();
        return { outcome: 'applied', branch: applied, elements, position: recording.position };
    }
    catch (fault) {
        await ended.catch(() => undefined);
        throw fault;
    }
};

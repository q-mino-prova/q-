// The node's consumers on IndexedDB (DOM-14, DOM-16, DOM-22, WEB-8, WEB-10;
// part 21.2): the outbox of an effect, read from its domain's store, where
// its command wrote the entry; the executors' state and the reactions'
// consumers', in the node's store, each commit with the writer's term; the
// versions the node keeps, the union of every domain's. On the model of the
// oracle's cell (TST-2) and of the relay's storage on SQLite (MBX-8).
import * as zz from '@q-mino/domains/library';
import { the_range_of } from "./command.js";
import { the_node_s_store } from "./database.js";
import { the_store_of } from "./records.js";
import { the_end_of, the_record_of, the_records_of as records_of, the_result_of, } from "./requests.js";
import { the_term_holds } from "./the_writer.js";
/** The business domain whose command queues an effect: its path, before `/effect/`. */
const the_domain_of_an_effect = (effect) => effect.split('/effect/')[0] ?? effect;
const a_position = (count) => zz.position.parse(String(count));
const the_number_in = (key, at) => {
    const part = Array.isArray(key) ? key[at] : undefined;
    if (typeof part !== 'number')
        throw new Error('a record kept under a key out of form');
    return part;
};
/**
 * The outbox (DOM-14): an effect's entries from a position on, inclusive,
 * in the node's order of entries, then each new one as a commit queues it.
 */
export const the_node_s_outbox = (node) => (effect) => (from) => {
    const store = the_store_of(the_domain_of_an_effect(effect));
    const read = async (start) => {
        const transaction = node.database.transaction(store, 'readonly');
        const range = node.key_range.bound(['entry', effect, start], ['entry', effect, Number.POSITIVE_INFINITY]);
        const kept = transaction.objectStore(store);
        const [keys, entries] = await Promise.all([
            the_result_of(kept.getAllKeys(range)),
            records_of(kept.getAll(range)),
        ]);
        return keys.map((key, at) => ({
            position: a_position(the_number_in(key, 2)),
            // cast: the adapter's own record, written under an entry's key by `execute_in`
            entry: entries[at],
        }));
    };
    async function* the_entries() {
        let next = from === undefined ? 1 : Number(from);
        for (;;) {
            const woken = node.bell.next();
            const given = await read(next);
            const last = given.at(-1);
            if (last === undefined) {
                await woken;
                continue;
            }
            yield* given;
            next = Number(last.position) + 1;
        }
    }
    return the_entries();
};
/** One commit in the node's store, with the writer's term (WEB-10). */
const in_the_node_s_store = (node) => async (write) => {
    const transaction = node.database.transaction(the_node_s_store, 'readwrite');
    const ended = the_end_of(transaction);
    try {
        await the_term_holds(transaction, node.term);
        write(transaction.objectStore(the_node_s_store));
        await ended;
    }
    catch (fault) {
        await ended.catch(() => undefined);
        throw fault;
    }
};
/** A record of the node's store, read alone. */
const in_the_node = async (node, key) => {
    const transaction = node.database.transaction(the_node_s_store, 'readonly');
    return the_record_of(transaction.objectStore(the_node_s_store).get(key));
};
/** The records of the node's store under a prefix, in its order. */
const under = async (node, prefix) => {
    const transaction = node.database.transaction(the_node_s_store, 'readonly');
    return records_of(transaction.objectStore(the_node_s_store).getAll(the_range_of(node.key_range, prefix)));
};
const a_position_kept = (value) => typeof value === 'number' ? a_position(value) : undefined;
/** The executors' durable state (DOM-14), in the node's store: a position per effect, its held entries by their key. */
export const the_executors_state = (node) => {
    const commit = in_the_node_s_store(node);
    const held_key = (entry) => [
        'executor',
        'held',
        entry.entry.effect,
        entry.entry.id,
    ];
    return {
        position: async (effect) => a_position_kept(await in_the_node(node, ['executor', 'position', effect])),
        advance: (effect) => (to) => commit((store) => {
            store.put(Number(to), ['executor', 'position', effect]);
        }),
        held: async (effect) => 
        // cast: the adapter's own records, written by `hold` below
        (await under(node, ['executor', 'held', effect])).toSorted((a, b) => Number(a.position) - Number(b.position)),
        hold: (entry) => commit((store) => {
            store.put(entry, held_key(entry));
        }),
        release: (entry) => commit((store) => {
            store.delete(held_key(entry));
        }),
        discarded: (trace) => commit((store) => {
            store.put(trace, [
                'executor',
                'discarded',
                trace.letter.entry.effect,
                trace.letter.entry.id,
            ]);
        }),
    };
};
/** Every entry the executors hold, in the order of the outbox: what the user is told (USR-8). */
export const the_entries_held = (node) => async () => 
// cast: the adapter's own records, written by `the_executors_state`
(await under(node, ['executor', 'held'])).toSorted((a, b) => Number(a.position) - Number(b.position));
const the_part_named = (part) => [
    part.reaction,
    part.fact.operation.scope,
    part.fact.operation.id,
    part.part,
];
const the_part_s_key = (part) => [
    'reaction',
    'held',
    ...the_part_named(part),
];
const in_the_log_s_order = (a, b) => Number(a.position) - Number(b.position) || a.part - b.part;
/** The reactions' consumers' durable state (DOM-16), in the node's store: a position per reaction, its held parts by their key. */
export const the_reactions_state = (node) => {
    const commit = in_the_node_s_store(node);
    return {
        position: async (reaction) => a_position_kept(await in_the_node(node, ['reaction', 'position', reaction])),
        advance: (reaction) => (to) => commit((store) => {
            store.put(Number(to), ['reaction', 'position', reaction]);
        }),
        held: async (reaction) => 
        // cast: the adapter's own records, written by `hold` below
        (await under(node, ['reaction', 'held', reaction])).toSorted(in_the_log_s_order),
        hold: (part) => commit((store) => {
            store.put(part, the_part_s_key(part));
        }),
        release: (part) => commit((store) => {
            store.delete(the_part_s_key(part));
        }),
        discarded: (trace) => commit((store) => {
            store.put(trace, ['reaction', 'discarded', ...the_part_named(trace.letter)]);
        }),
    };
};
/** Every part the reactions' consumers hold, in the log's order. */
export const the_parts_held = (node) => async () => 
// cast: the adapter's own records, written by `the_reactions_state`
(await under(node, ['reaction', 'held'])).toSorted(in_the_log_s_order);
/** The versions the node keeps (DOM-22): every domain's, by path and version, distinct. */
export const the_versions_kept = (node) => async () => {
    const stores = node.paths.map(the_store_of);
    const transaction = node.database.transaction(stores, 'readonly');
    const keys = await Promise.all(stores.map((store) => the_result_of(transaction.objectStore(store).getAllKeys(the_range_of(node.key_range, ['version'])))));
    return keys.flat().map((key) => {
        const [, path, version] = Array.isArray(key) ? key : [];
        if (typeof path !== 'string' || typeof version !== 'string')
            throw new Error('a version kept under a key out of form');
        return { path, version: zz.semver.parse(version) };
    });
};
/** The node's position: the last fact's (DOM-17), as a snapshot reads it. */
export const the_node_s_position = (node) => async () => {
    const last = await in_the_node(node, 'the_last_fact');
    return a_position(typeof last === 'number' ? last : 0);
};

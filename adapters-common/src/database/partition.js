// An extension's partition on the node's database (EXT-14, WEB-12): its own
// store, under its name, which the kernel's adapter alone opens. Keys are
// the extension's strings (ordered by code units, as EXT-14 asks), values
// its JSON. A commit is one transaction: the writer's term, the partition's
// size, then its writes in order, all or none.
import * as boundary from '@q-mino/boundary';
import { no_room, the_name_of, the_node_s_store, the_term_holds, } from "./the_node_s_database.js";
/** The key of a partition's size in the node's store. */
const the_size_of = (name) => ['the_size_of_a_partition', name];
/** A partition's measure, the oracle's (EXT-14): the characters of its keys and of its values' JSON. */
const the_characters_of = (key, value) => value === undefined ? 0 : key.length + JSON.stringify(value).length;
const a_range = (read) => ({
    lower: read.from === undefined ? undefined : { key: read.from, open: false },
    upper: read.before === undefined ? undefined : { key: read.before, open: true },
});
const the_value_of = (value) => value === undefined ? undefined : boundary.json.parse(value);
/** The storage the kernel gives an extension (`its_storage`), over its store. */
export const the_partition_of = (node) => (name) => {
    const store = the_name_of({ of: 'an_extension', name });
    const read = (asked) => node.database.transaction([store], 'readonly', async (transaction) => {
        if (asked.read === 'keys') {
            const values = await Promise.all(asked.keys.map((key) => transaction.get(store, key)));
            const entries = asked.keys.flatMap((key, at) => {
                const value = the_value_of(values[at]);
                return value === undefined ? [] : [{ key, value }];
            });
            return { answer: 'read', entries };
        }
        const kept = await transaction.within(store, a_range(asked));
        const entries = kept.map((record) => ({
            key: boundary.a_key.parse(record.key),
            value: boundary.json.parse(record.value),
        }));
        return { answer: 'read', entries };
    });
    const commit = async (writes) => {
        try {
            return await node.database.transaction([store, the_node_s_store], 'readwrite', async (transaction) => {
                await the_term_holds(transaction, node.term);
                const keys = [...new Set(writes.map((write) => write.key))];
                const [size, before] = await Promise.all([
                    transaction.get(the_node_s_store, the_size_of(name)),
                    Promise.all(keys.map((key) => transaction.get(store, key))),
                ]);
                const after = new Map(keys.map((key, at) => [key, the_value_of(before[at])]));
                for (const write of writes)
                    after.set(write.key, write.write === 'set' ? write.value : undefined);
                const grown = keys.reduce((sum, key, at) => sum +
                    the_characters_of(key, after.get(key)) -
                    the_characters_of(key, the_value_of(before[at])), 0);
                const now = (typeof size === 'number' ? size : 0) + grown;
                // Refused: nothing written, the transaction ends with no write.
                if (now > node.characters)
                    return { answer: 'refused', why: 'the_partition_is_full' };
                for (const write of writes)
                    if (write.write === 'set')
                        transaction.put(store, write.key, write.value);
                    else
                        transaction.delete(store, write.key);
                transaction.put(the_node_s_store, the_size_of(name), now);
                return { answer: 'committed' };
            });
        }
        catch (fault) {
            if (no_room(fault))
                return { answer: 'refused', why: 'the_partition_is_full' };
            throw fault;
        }
    };
    return { read, commit };
};

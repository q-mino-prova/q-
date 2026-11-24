/** The size of a partition: the characters of its keys and of its values' JSON. */
const the_size_of = (entries) => [...entries].reduce((size, [key, value]) => size + key.length + JSON.stringify(value).length, 0);
/** Keys in the order of their code units. */
const in_order = (keys) => [...keys].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
/**
 * The partitions of a node's extensions on the oracle (EXT-14), each at most
 * `characters` large: `of(name)`, the storage the kernel gives that
 * extension (`boundary.Ports['its_storage']`); `kept(name)`, what its
 * partition holds, for a story to read (the kernel never does).
 */
export const partitions = (limit) => {
    const kept = new Map();
    const entries_of = (name) => kept.get(name) ?? new Map();
    const of = (name) => ({
        read: (read) => {
            const entries = entries_of(name);
            const keys = read.read === 'keys'
                ? read.keys
                : in_order(entries.keys()).filter((key) => (read.from === undefined || key >= read.from) &&
                    (read.before === undefined || key < read.before));
            return Promise.resolve({
                answer: 'read',
                entries: keys.flatMap((key) => {
                    const value = entries.get(key);
                    return value === undefined ? [] : [{ key, value }];
                }),
            });
        },
        commit: (writes) => {
            const next = new Map(entries_of(name));
            for (const write of writes) {
                if (write.write === 'set')
                    next.set(write.key, write.value);
                else
                    next.delete(write.key);
            }
            if (the_size_of(next) > limit.characters) {
                return Promise.resolve({ answer: 'refused', why: 'the_partition_is_full' });
            }
            kept.set(name, next);
            return Promise.resolve({ answer: 'committed' });
        },
    });
    return { of, kept: entries_of };
};

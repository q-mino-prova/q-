// The node's storage over its database (WEB-8..WEB-12, part 21.2; on any
// substrate since part B2 of the assistant) [Q, C, 27 Nov 2026]: what the
// composition root wires the domains' modules and the consumers over, once
// the writer has its term: a business domain's store for its command port
// and its reads, the node's log, the outbox, the executors' and the
// reactions' state, the versions kept, the entries and parts held, an
// extension's partition. The substrate opens the database and decides the
// writer (IndexedDB by the browser's lock, WEB-10; SQLite by the file's).
import { the_entries_held, the_executors_state, the_node_s_outbox, the_node_s_position, the_parts_held, the_reactions_state, the_versions_kept, } from "./consumers.js";
import { a_bell, the_node_s_log } from "./log.js";
import { the_partition_of } from "./partition.js";
/** The node's storage over its database, for the writer of a term. */
export const the_node_s_storage_over = (database, node) => {
    const bell = a_bell();
    const consumers = { database, term: node.term, bell, paths: node.paths };
    return {
        term: node.term,
        database,
        domain: (path) => ({ database, term: node.term, path, committed: bell.ring }),
        log: the_node_s_log({ database, paths: node.paths, bell }),
        outbox: the_node_s_outbox(consumers),
        executor: the_executors_state(consumers),
        reactions: the_reactions_state(consumers),
        stored_versions: the_versions_kept(consumers),
        held: the_entries_held(consumers),
        held_parts: the_parts_held(consumers),
        position: the_node_s_position(consumers),
        partition: the_partition_of({ database, term: node.term, characters: node.characters }),
    };
};

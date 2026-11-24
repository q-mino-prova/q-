// The node's storage on IndexedDB, put together (WEB-8..WEB-12, part 21.2):
// the database opened with the stores the release needs, the writer asked
// for, and, in the tab that is the writer, what the composition root wires
// the domains' modules and the consumers over: a business domain's store
// for its command port and its reads, the node's log, the outbox, the
// executors' and the reactions' state, the versions kept, an extension's
// partition. A tab that is not the writer gets nothing to compose (WEB-10).
import { the_entries_held, the_executors_state, the_node_s_outbox, the_node_s_position, the_parts_held, the_reactions_state, the_versions_kept, } from "./consumers.js";
import { open_the_node_s_database } from "./database.js";
import { a_bell, the_node_s_log } from "./log.js";
import { the_partition_of } from "./partition.js";
import { ask_to_be_the_writer, } from "./the_writer.js";
/** Opens the node's storage and asks to be its writer, as the tab asks (WEB-10). */
export const the_node_s_storage = (browser) => async (stores, how) => {
    const opened = await open_the_node_s_database(browser.indexed_db)(stores.name, [
        ...stores.paths.map((path) => ({ of: 'a_domain', path })),
        ...stores.extensions.map((name) => ({ of: 'an_extension', name })),
    ]);
    const writer = await ask_to_be_the_writer(browser.locks, opened.database)(how);
    if (writer.writer === 'another_tab') {
        return {
            writer: 'another_tab',
            closes: () => {
                opened.database.close();
            },
        };
    }
    const bell = a_bell();
    const node = {
        database: opened.database,
        key_range: browser.key_range,
        term: writer.term,
        bell,
        paths: stores.paths,
    };
    return {
        writer: 'this_tab',
        term: writer.term,
        lost: writer.lost,
        let_go: writer.let_go,
        closed: opened.closed,
        database: opened.database,
        domain: (path) => ({
            database: opened.database,
            key_range: browser.key_range,
            term: writer.term,
            path,
            committed: bell.ring,
        }),
        log: the_node_s_log({
            database: opened.database,
            key_range: browser.key_range,
            paths: stores.paths,
            bell,
        }),
        outbox: the_node_s_outbox(node),
        executor: the_executors_state(node),
        reactions: the_reactions_state(node),
        stored_versions: the_versions_kept(node),
        held: the_entries_held(node),
        held_parts: the_parts_held(node),
        position: the_node_s_position(node),
        partition: the_partition_of({
            database: opened.database,
            key_range: browser.key_range,
            term: writer.term,
            characters: stores.characters,
        }),
    };
};

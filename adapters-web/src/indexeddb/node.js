// The node's storage on IndexedDB, put together (WEB-8..WEB-12, part 21.2):
// the database opened with the stores the release needs, the writer asked
// for, and, in the tab that is the writer, the node's storage over it
// (`adapters-common`, the same over SQLite): what the composition root
// wires the domains' modules and the consumers over. A tab that is not the
// writer gets nothing to compose (WEB-10).
import { the_node_s_storage_over, } from '@q-mino/adapters-common';
import { open_the_node_s_database } from "./database.js";
import { on_indexeddb } from "./on_indexeddb.js";
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
    return {
        writer: 'this_tab',
        ...the_node_s_storage_over(on_indexeddb(opened.database, browser.key_range), {
            term: writer.term,
            paths: stores.paths,
            characters: stores.characters,
        }),
        lost: writer.lost,
        let_go: writer.let_go,
        closed: opened.closed,
        connection: opened.database,
    };
};

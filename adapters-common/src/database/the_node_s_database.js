// The node's database as its modules see it (WEB-8, WEB-9; part B2 of the
// assistant, AST-2) [Q, C, 27 Nov 2026]: named stores of records, each
// record under a key in IndexedDB's order, and transactions over a set of
// stores, all or nothing. The browser's IndexedDB is one (`adapters-web`,
// the PWA), SQLite another (`adapters-node`, the assistant's node): the
// modules of the kernel's domains, the node's log, its consumers and the
// extensions' partitions are written once over this surface (ADP-6, ADP-8),
// and each substrate translates it to its technology. Rejected: a SQLite
// copy of each module (two copies of one translation, which would drift).
/** The node's own store: the writer's term, the node's counters, the consumers' state (WEB-8). */
export const the_node_s_store = 'node';
/** A store's name in the database, told apart by its kind. */
export const the_name_of = (store) => store.of === 'a_domain' ? `domain ${store.path}` : `extension ${store.name}`;
/**
 * A substrate's fault when the device has no room for a commit: IndexedDB's
 * `QuotaExceededError`, and SQLite's full disk told by that name.
 */
export const no_room = (fault) => fault instanceof Error && fault.name === 'QuotaExceededError';
/** The key of the writer's term in the node's store (WEB-10). */
export const the_writer_s_term = 'the_writer_s_term';
/** A commit begun by a writer that is no longer the writer: rolled back, nothing written (WEB-10). */
export class NotTheWriter extends Error {
    constructor() {
        super('this tab is no longer the writer of the node');
        this.name = 'NotTheWriter';
    }
}
/**
 * Inside a commit's transaction, before its writes: the term still this
 * writer's, or `NotTheWriter` thrown, which rolls the transaction back.
 */
export const the_term_holds = async (transaction, term) => {
    const now = await transaction.get(the_node_s_store, the_writer_s_term);
    if (now !== term)
        throw new NotTheWriter();
};
/** A new writer's term in the node's store, one more than the last (WEB-10). */
export const a_new_term = (database) => database.transaction([the_node_s_store], 'readwrite', async (transaction) => {
    const before = await transaction.get(the_node_s_store, the_writer_s_term);
    const term = typeof before === 'number' ? before + 1 : 1;
    transaction.put(the_node_s_store, the_writer_s_term, term);
    return term;
});

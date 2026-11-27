// The node's storage on IndexedDB (step 21; WEB-8..WEB-12): the database, its
// writer, the storage kept, and the substrate the modules of the node's
// database run on (`adapters-common`, part B2 of the assistant).
export { delete_the_node_s_database, open_the_node_s_database, } from "./database.js";
export { ask_to_be_the_writer, the_writer_s_lock, } from "./the_writer.js";
export { ask_to_keep_the_storage, } from "./the_storage_kept.js";
export { on_indexeddb } from "./on_indexeddb.js";
export { the_node_s_storage, } from "./node.js";

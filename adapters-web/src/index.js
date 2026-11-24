// adapters-web: one folder per adapter, each imported only through its index.ts.
export { the_device_s_clock, the_device_s_zone, the_time_that_passes } from "./clock/index.js";
export { the_device_s_network, } from "./network/index.js";
export { ids_drawn_at_random, the_bytes_of_an_id, } from "./randomness/index.js";
export { her_node_over, } from "./her_node/index.js";
export { the_link_of_a_ticket, the_ticket_in_a_link, the_mark_of_a_ticket, } from "./ticket_link/index.js";
export { the_fragment_of_a_view, the_mark_of_a_view, the_view_in_a_fragment, the_view_in_a_link, the_way_to_a_view, } from "./view_link/index.js";
export { the_qr_of, the_svg_of, the_texts_seen, the_text_in, the_bytes_a_qr_holds, a_look_every, } from "./qr/index.js";
export { scan_with_a_camera, the_camera, open_a_camera, why_not_on, the_constraints_of, } from "./camera/index.js";
export { save_a_file, pick_a_file, a_saved_file_s_minute, } from "./files/index.js";
export { the_relay_s_http_transports, the_longest_wait_for_the_relay, the_paths_of_the_relay, } from "./relay_client/index.js";
export { delete_the_node_s_database, open_the_node_s_database, the_name_of, the_node_s_store, ask_to_be_the_writer, the_term_holds, the_writer_s_lock, NotTheWriter, ask_to_keep_the_storage, the_partition_of, execute_in, recorded_in, the_keys, the_operators, a_bell, the_node_s_log, read_in, the_range_of, ARecordOutOfItsForm, deleted, every_parsed, on_a_record, on_the_records, parsed, set, the_records_of_a_domain, the_store_of, after, compare_values, reads_in, selection_operators, the_entries_held, the_executors_state, the_node_s_outbox, the_node_s_position, the_parts_held, the_reactions_state, the_versions_kept, the_node_s_storage, seals_ports_on_indexeddb, post_ports_on_indexeddb, bonds_ports_on_indexeddb, the_address_book_s_records, extensions_ports_on_indexeddb, user_ports_on_indexeddb, } from "./indexeddb/index.js";

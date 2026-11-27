// q-'s oracle (TST-2, V10, MBX-7): the in-memory state adapter of the
// kernel's domains, one module per domain, over one cell; the reference
// interpreter the other adapters are compared with. Since part 8.2 the
// relay's, `mailbox`; since part 9.2 the safe's, `seals`; since part 11.3 the
// address book's, `bonds`, beside the safe's in the phone's cell; since part
// 10.2 the requests of `post`, likewise; since part 12.4 the extensions'
// partitions and the transport of an extension in process, and the
// kernel's office of the extensions, `extensions`, beside the address book.
// Since part 15.2 the user domain's offices, `user`, beside the kernel's.
// Since part B4 of the assistant the relay's stand, `stand`, beside `mailbox`.
export { cell, position_at, seen_by } from "./cell.js";
export { compare_values, log } from "./interpreter.js";
export { mailbox_ports, no_deposit } from "./mailbox.js";
export { no_invitation, stand_ports } from "./stand.js";
export { no_secret, seals_ports } from "./seals.js";
export { bonds_ports, no_bond } from "./bonds.js";
export { no_request, post_ports } from "./post.js";
export { extensions_ports, no_activation } from "./extensions.js";
export { partitions } from "./partitions.js";
export { nothing_asked, user_ports } from "./user.js";

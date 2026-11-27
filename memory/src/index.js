// The `memory` configurator (CFG-3): the phones and the relay in one process,
// the stack of q-'s oracles (TST-2). Since part 8.2 the relay over the oracle
// of `mailbox`; since step 17 the phone over the oracles of the kernel's
// domains, and the stack of them both over the transports in process.
export * from "./oracle/index.js";
export { a_new_relay, relay, the_desks_interface, the_scope_of_a_deposit, the_scope_of_a_leave, the_scope_of_a_take, } from "./relay/index.js";
export { a_new_phone, on_the_cell, phone, TheExtensionsDoNotCompose } from "./phone/index.js";
export { a_stack, the_relay_s_transports } from "./stack/index.js";

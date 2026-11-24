// generated
// The selection predicates of `bonds/address_book` from `bond_selection.ts`
// (DOM-25): the same objects under the same names, branded with their path
// (DOM-24), each schema with its output type under the same name, so that one
// import gives both. Only this module imports `bond_selection.ts`.
import { z } from 'zod';
import * as selection from "./bond_selection.js";
/**
 * The bond has this id.
 *
 * @see {@link selection.the_bond_has_this_id}
 */
export const the_bond_has_this_id = selection.the_bond_has_this_id.brand();
/**
 * The bond is in the user's list.
 *
 * @see {@link selection.the_bond_is_kept}
 */
export const the_bond_is_kept = selection.the_bond_is_kept.brand();
/**
 * My mailbox of the bond is at this deposit address: a letter deposited there is for this bond.
 *
 * @see {@link selection.my_mailbox_of_the_bond_is_at_this_address}
 */
export const my_mailbox_of_the_bond_is_at_this_address = selection.my_mailbox_of_the_bond_is_at_this_address.brand();
/**
 * The bond's ticket is ready: its mailbox is collected for an introduction (BND-11).
 *
 * @see {@link selection.its_ticket_is_ready}
 */
export const its_ticket_is_ready = selection.its_ticket_is_ready.brand();

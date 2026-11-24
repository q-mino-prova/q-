// generated
// The selection predicates of `bonds/address_book` from `ticket_selection.ts`
// (DOM-25): the same objects under the same names, branded with their path
// (DOM-24), each schema with its output type under the same name, so that one
// import gives both. Only this module imports `ticket_selection.ts`.
import { z } from 'zod';
import * as selection from "./ticket_selection.js";
/**
 * The ticket is the bond's with this id.
 *
 * @see {@link selection.the_ticket_has_this_id}
 */
export const the_ticket_has_this_id = selection.the_ticket_has_this_id.brand();
/**
 * The ticket is ready: shown, and used by no one yet.
 *
 * @see {@link selection.the_ticket_is_ready}
 */
export const the_ticket_is_ready = selection.the_ticket_is_ready.brand();
/**
 * The ticket's mailbox is at this deposit address: an introduction deposited there is for it.
 *
 * @see {@link selection.the_ticket_s_mailbox_is_at_this_address}
 */
export const the_ticket_s_mailbox_is_at_this_address = selection.the_ticket_s_mailbox_is_at_this_address.brand();

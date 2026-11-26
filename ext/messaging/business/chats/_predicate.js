// generated
// The predicates of `business/chats` from `predicate.ts` (DOM-25): the same
// objects under the same names, branded with their path (DOM-24), each schema
// with its output type under the same name, so that one import gives both. Only
// this module imports `predicate.ts`.
import { z } from 'zod';
import * as predicate from "./predicate.js";
/**
 * A message with this identity is filed in the bond's chat, written or received.
 *
 * @see {@link predicate.a_message_has_this_id}
 */
export const a_message_has_this_id = predicate.a_message_has_this_id.brand();
/**
 * This message of hers waits for what comes back: written, not closed.
 *
 * @see {@link predicate.the_message_waits}
 */
export const the_message_waits = predicate.the_message_waits.brand();
/**
 * What came back of a message is its receipt: a predicate over what the return is given, its meaning the dsl's.
 *
 * @see {@link predicate.the_message_was_received}
 */
export const the_message_was_received = predicate.the_message_was_received.brand();
/**
 * What came back of a message is no receipt within its wait.
 *
 * @see {@link predicate.the_message_had_no_receipt}
 */
export const the_message_had_no_receipt = predicate.the_message_had_no_receipt.brand();
/**
 * What came back of a message is a peer that cannot receive it.
 *
 * @see {@link predicate.the_peer_cannot_receive_it}
 */
export const the_peer_cannot_receive_it = predicate.the_peer_cannot_receive_it.brand();
/**
 * What came back of a message is its calling off, her own gesture.
 *
 * @see {@link predicate.the_message_was_called_off}
 */
export const the_message_was_called_off = predicate.the_message_was_called_off.brand();
/**
 * The bond's chat is read up to this message of it, or a later one.
 *
 * @see {@link predicate.the_chat_is_read_up_to_it}
 */
export const the_chat_is_read_up_to_it = predicate.the_chat_is_read_up_to_it.brand();

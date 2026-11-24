// generated
// The predicates of `post/requests` from `predicate.ts` (DOM-25): the same
// objects under the same names, branded with their path (DOM-24), each schema
// with its output type under the same name, so that one import gives both. Only
// this module imports `predicate.ts`.
import { z } from 'zod';
import * as predicate from "./predicate.js";
/**
 * A request with this identity has been sent, whatever became of it.
 *
 * @see {@link predicate.a_request_has_this_id}
 */
export const a_request_has_this_id = predicate.a_request_has_this_id.brand();
/**
 * This request is waiting for its response: neither answered, nor closed with no response, nor called off.
 *
 * @see {@link predicate.the_request_is_waiting}
 */
export const the_request_is_waiting = predicate.the_request_is_waiting.brand();
/**
 * This request has been answered: a response from its face came while it waited.
 *
 * @see {@link predicate.the_request_has_been_answered}
 */
export const the_request_has_been_answered = predicate.the_request_has_been_answered.brand();
/**
 * This request has been called off while it waited (F7, EXT-7).
 *
 * @see {@link predicate.the_request_has_been_called_off}
 */
export const the_request_has_been_called_off = predicate.the_request_has_been_called_off.brand();
/**
 * The time of this request is not over at this instant.
 *
 * @see {@link predicate.the_time_of_the_request_is_not_over}
 */
export const the_time_of_the_request_is_not_over = predicate.the_time_of_the_request_is_not_over.brand();
/**
 * This request went to the face of this key: its letter was sealed for it.
 *
 * @see {@link predicate.the_request_went_to_this_face}
 */
export const the_request_went_to_this_face = predicate.the_request_went_to_this_face.brand();

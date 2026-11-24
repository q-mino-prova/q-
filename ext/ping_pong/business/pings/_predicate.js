// generated
// The predicates of `business/pings` from `predicate.ts` (DOM-25): the same
// objects under the same names, branded with their path (DOM-24), each schema
// with its output type under the same name, so that one import gives both. Only
// this module imports `predicate.ts`.
import { z } from 'zod';
import * as predicate from "./predicate.js";
/**
 * A ping with this identity has been sent, whatever came back.
 *
 * @see {@link predicate.a_ping_has_this_id}
 */
export const a_ping_has_this_id = predicate.a_ping_has_this_id.brand();
/**
 * This ping waits for what comes back: sent, not closed.
 *
 * @see {@link predicate.the_ping_waits}
 */
export const the_ping_waits = predicate.the_ping_waits.brand();
/**
 * What came back of a ping is its pong: a predicate over what the return is given, its meaning the dsl's.
 *
 * @see {@link predicate.the_pong_came_back}
 */
export const the_pong_came_back = predicate.the_pong_came_back.brand();
/**
 * What came back of a ping is no response within its time.
 *
 * @see {@link predicate.the_ping_had_no_response}
 */
export const the_ping_had_no_response = predicate.the_ping_had_no_response.brand();
/**
 * What came back of a ping is a peer that cannot answer it.
 *
 * @see {@link predicate.the_peer_cannot_answer}
 */
export const the_peer_cannot_answer = predicate.the_peer_cannot_answer.brand();
/**
 * What came back of a ping is its calling off, the user's own gesture.
 *
 * @see {@link predicate.the_ping_was_called_off}
 */
export const the_ping_was_called_off = predicate.the_ping_was_called_off.brand();
/**
 * A pong with this identity has been given back.
 *
 * @see {@link predicate.a_pong_has_this_id}
 */
export const a_pong_has_this_id = predicate.a_pong_has_this_id.brand();

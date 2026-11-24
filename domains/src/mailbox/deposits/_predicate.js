// generated
// The predicates of `mailbox/deposits` from `predicate.ts` (DOM-25): the same
// objects under the same names, branded with their path (DOM-24), each schema
// with its output type under the same name, so that one import gives both. Only
// this module imports `predicate.ts`.
import { z } from 'zod';
import * as predicate from "./predicate.js";
/**
 * A deposit with this id is in the relay's hands, kept or discarded.
 *
 * @see {@link predicate.a_deposit_has_this_id}
 */
export const a_deposit_has_this_id = predicate.a_deposit_has_this_id.brand();
/**
 * The envelope of this deposit is still on its mailbox: its seven days are running.
 *
 * @see {@link predicate.the_envelope_is_kept}
 */
export const the_envelope_is_kept = predicate.the_envelope_is_kept.brand();

// generated
// The facts of `user/activities` from `fact.ts` (DOM-25): the same objects
// under the same names, branded with their path (DOM-24), each schema with its
// output type under the same name, so that one import gives both. Only this
// module imports `fact.ts`.
import { z } from 'zod';
import * as fact from "./fact.js";
/**
 * An activity has been asked (USR-2): her gesture, kept with its id before the first attempt (DOM-12).
 *
 * @see {@link fact.an_activity_has_been_asked}
 */
export const an_activity_has_been_asked = fact.an_activity_has_been_asked.brand();
/**
 * An activity asked already has been asked again: nothing changes (DOM-6).
 *
 * @see {@link fact.an_activity_has_been_asked_again}
 */
export const an_activity_has_been_asked_again = fact.an_activity_has_been_asked_again.brand();
/**
 * An activity has ended (USR-3): how, in her words, and when.
 *
 * @see {@link fact.an_activity_has_ended}
 */
export const an_activity_has_ended = fact.an_activity_has_ended.brand();

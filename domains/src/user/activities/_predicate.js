// generated
// The predicates of `user/activities` from `predicate.ts` (DOM-25): the same
// objects under the same names, branded with their path (DOM-24), each schema
// with its output type under the same name, so that one import gives both. Only
// this module imports `predicate.ts`.
import { z } from 'zod';
import * as predicate from "./predicate.js";
/**
 * An activity with this id has been asked.
 *
 * @see {@link predicate.an_activity_has_this_id}
 */
export const an_activity_has_this_id = predicate.an_activity_has_this_id.brand();
/**
 * The activity with this id is in progress: asked, not ended.
 *
 * @see {@link predicate.the_activity_is_in_progress}
 */
export const the_activity_is_in_progress = predicate.the_activity_is_in_progress.brand();

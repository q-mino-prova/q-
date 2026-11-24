// generated
// The queries of `user/activities` from `query.ts` (DOM-25): the same objects
// under the same names, each schema with its output type under the same name,
// so that one import gives both. Only this module imports `query.ts`.
import { z } from 'zod';
import * as query from "./query.js";
/**
 * An activity, by its id: what she asked, when, and where it is.
 *
 * @see {@link query.an_activity}
 */
export const an_activity = query.an_activity;
/**
 * The input of `an_activity`, declared inline.
 *
 * @see {@link query.an_activity}
 */
export const an_activity_input = query.an_activity.input;
/**
 * The activities in progress, in the order she asked them.
 *
 * @see {@link query.the_activities_in_progress}
 */
export const the_activities_in_progress = query.the_activities_in_progress;
/**
 * The input of `the_activities_in_progress`, declared inline.
 *
 * @see {@link query.the_activities_in_progress}
 */
export const the_activities_in_progress_input = query.the_activities_in_progress.input;

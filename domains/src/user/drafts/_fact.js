// generated
// The facts of `user/drafts` from `fact.ts` (DOM-25): the same objects under
// the same names, branded with their path (DOM-24), each schema with its output
// type under the same name, so that one import gives both. Only this module
// imports `fact.ts`.
import { z } from 'zod';
import * as fact from "./fact.js";
/**
 * A draft has been kept: its text, new or changed.
 *
 * @see {@link fact.a_draft_has_been_kept}
 */
export const a_draft_has_been_kept = fact.a_draft_has_been_kept.brand();
/**
 * A draft has been kept again with the text it holds: nothing changes (DOM-6).
 *
 * @see {@link fact.a_draft_has_been_kept_again}
 */
export const a_draft_has_been_kept_again = fact.a_draft_has_been_kept_again.brand();
/**
 * A draft has been dropped: used, or given up.
 *
 * @see {@link fact.a_draft_has_been_dropped}
 */
export const a_draft_has_been_dropped = fact.a_draft_has_been_dropped.brand();
/**
 * A draft not kept has been dropped again: nothing changes (DOM-6).
 *
 * @see {@link fact.a_draft_has_been_dropped_again}
 */
export const a_draft_has_been_dropped_again = fact.a_draft_has_been_dropped_again.brand();

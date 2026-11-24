import * as z from 'zod';
/** An operation's identity (DOM-11, DOM-12): created before the first attempt, kept on a retry. */
export const operation_id = z.string().min(1).brand();
/**
 * The correlation of a chain of facts born of one intention (DOM-10, D56, §
 * "La busta e la pila"): created at the origin, by the client if it gives
 * one (D72.7), else by the entry; neither a secret nor a permission. Every
 * fact, outbox entry and event derived from a fact keeps it: a reaction
 * invokes with the correlation of the fact it reacts to, the executor
 * returns with the entry's, which is the fact's that queued it. Not part of
 * the operation's identity (DOM-11): a retry keeps both. A, 16 Nov 2026 (5)
 */
export const correlation = z.string().min(1).brand();
/**
 * The fingerprint of an operation (DOM-11, D100): computed by the library
 * where the request enters, over its path and its input as sent, and kept
 * with the fact the operation records, so that the duplicate branch tells a
 * retry from another request under the same identity. Opaque, compared for
 * equality only; it never leaves the node (PER-18).
 */
export const fingerprint = z.string().min(1).brand();

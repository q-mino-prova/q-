// generated
// The values of `post` from `value.ts` (DOM-25): the same objects under the
// same names, each schema with its output type under the same name, so that one
// import gives both. Only this module imports `value.ts`.
import { z } from 'zod';
import * as value from "./value.js";
/**
 * A letter's identity (F7, DOM-11): the BLAKE2b-256 of what names it, 32
 * bytes. A request's, from whose effect it is and the entry's id; a
 * response's, from the request it answers (PST-2).
 *
 * @see {@link value.identity}
 */
export const identity = value.identity;
/**
 * A face's Ed25519 public key, as the safe gives it: the key that signs its letters and that letters for it are sealed for.
 *
 * @see {@link value.face_key}
 */
export const face_key = value.face_key;
/**
 * An Ed25519 signature over a signed content.
 *
 * @see {@link value.signature}
 */
export const signature = value.signature;
/**
 * A deposit address D, in the relay's form (MBX-1): base64url, at most 128 characters.
 *
 * @see {@link value.deposit_address}
 */
export const deposit_address = value.deposit_address;
/**
 * A relay's address: https, as a bond keeps it (BND-4).
 *
 * @see {@link value.relay_address}
 */
export const relay_address = value.relay_address;
/**
 * The relays of a mailbox: one in stage 1, as a bond keeps them (BND-4).
 *
 * @see {@link value.relays}
 */
export const relays = value.relays;
/**
 * A mailbox to deposit on: its D and its relays.
 *
 * @see {@link value.mailbox}
 */
export const mailbox = value.mailbox;
/**
 * What a letter carries for the use case it invokes, or the event a response
 * carries: a JSON value, a claim (F2), which the leaf's schema or the
 * asker's delivery parses, at most `the_most_a_letter_carries` (PST-12).
 * Unknown to the post's types: a recursive JSON type goes too deep for the
 * library's (TS2589).
 *
 * @see {@link value.content}
 */
export const content = value.content;
/**
 * The bytes of something the post gives the machine: a signed content, a sealed letter, an envelope.
 *
 * @see {@link value.some_bytes}
 */
export const some_bytes = value.some_bytes;
/**
 * A persona a request names, a claim the kernel's node verifies (EXT-5, PER-7).
 *
 * @see {@link value.persona}
 */
export const persona = value.persona;
/**
 * What a request invokes (EXT-5): the kernel's use case, or an extension's leaf, by its path from the persona and the version of the surface the asker speaks.
 *
 * @see {@link value.invocation}
 */
export const invocation = value.invocation;
/**
 * Whose a request is (F7): the kernel composes it from the effect that asks
 * and the entry's id, the extension's name added by the kernel (EXT-12), and
 * hashes it into the request's identity.
 *
 * @see {@link value.whose_request}
 */
export const whose_request = value.whose_request;
/**
 * The schema of a letter: the one written since stage 1.
 *
 * @see {@link value.letter_schema}
 */
export const letter_schema = value.letter_schema;
/**
 * A request (F7, PST-1): its identity, the face that sends it, the mailbox
 * it is for (D, under the signature), its declared time (a claim, PER-13),
 * what it invokes and its input.
 *
 * @see {@link value.request}
 */
export const request = value.request;
/**
 * A response (F7, PST-1): its identity, the face that answers, the mailbox
 * it is for, its declared time, the request it answers, and the event of the
 * leaf that served it. It asks for no response.
 *
 * @see {@link value.response}
 */
export const response = value.response;
/**
 * A letter: a request or a response.
 *
 * @see {@link value.letter}
 */
export const letter = value.letter;
/**
 * A letter with its face's signature over its signed content (PST-1): what
 * is sealed. The signature may be missing: removing it is always possible
 * (PER-2), and the letter is then `anonymous`.
 *
 * @see {@link value.signed_letter}
 */
export const signed_letter = value.signed_letter;
/**
 * The format of an envelope: the one written since stage 1.
 *
 * @see {@link value.envelope_format}
 */
export const envelope_format = value.envelope_format;
/**
 * An envelope (PST-1): its format and the signed letter sealed for the face it goes to. What a relay keeps, opaque.
 *
 * @see {@link value.envelope}
 */
export const envelope = value.envelope;
/**
 * Why a letter is `anonymous` (PER-2): it has no signature, or one that does
 * not hold for the face it claims.
 *
 * @see {@link value.annotation_of_an_anonymous_letter}
 */
export const annotation_of_an_anonymous_letter = value.annotation_of_an_anonymous_letter;
/**
 * Who sent a letter, as the post verified it (F3, PER-4): a face, by the key
 * whose signature holds; or `anonymous`, its id the hash of its envelope, so
 * that every envelope is an operation of its own, with why.
 *
 * @see {@link value.caller}
 */
export const caller = value.caller;
/**
 * An envelope opened by a face of the node's user (PST-4): the letter and
 * its `Caller`; or why no letter came out of it, for the kernel's trace (F6).
 *
 * @see {@link value.opened_envelope}
 */
export const opened_envelope = value.opened_envelope;
/**
 * A letter in an envelope for a face (PST-3), or not: the face's key takes no seal (a claim, F2).
 *
 * @see {@link value.sealed_letter}
 */
export const sealed_letter = value.sealed_letter;

// generated
// The predicates of `bonds/address_book` from `predicate.ts` (DOM-25): the same
// objects under the same names, branded with their path (DOM-24), each schema
// with its output type under the same name, so that one import gives both. Only
// this module imports `predicate.ts`.
import { z } from 'zod';
import * as predicate from "./predicate.js";
/**
 * A face with this id is in the address book, being made or made.
 *
 * @see {@link predicate.a_face_has_this_id}
 */
export const a_face_has_this_id = predicate.a_face_has_this_id.brand();
/**
 * This face is made: it has its public key, and can be bonded (BND-1).
 *
 * @see {@link predicate.the_face_is_made}
 */
export const the_face_is_made = predicate.the_face_is_made.brand();
/**
 * A bond with this id is in the address book, kept or removed.
 *
 * @see {@link predicate.a_bond_has_this_id}
 */
export const a_bond_has_this_id = predicate.a_bond_has_this_id.brand();
/**
 * This bond is in the user's list.
 *
 * @see {@link predicate.the_bond_is_kept}
 */
export const the_bond_is_kept = predicate.the_bond_is_kept.brand();
/**
 * The user removed this bond.
 *
 * @see {@link predicate.the_bond_is_removed}
 */
export const the_bond_is_removed = predicate.the_bond_is_removed.brand();
/**
 * The user has a face, being made or made: in stage 1, her one face (BND-8).
 *
 * @see {@link predicate.the_user_has_a_face}
 */
export const the_user_has_a_face = predicate.the_user_has_a_face.brand();
/**
 * This face is being made: the safe is drawing its seed.
 *
 * @see {@link predicate.the_face_is_being_made}
 */
export const the_face_is_being_made = predicate.the_face_is_being_made.brand();
/**
 * The ticket of this bond is being prepared: the safe is drawing its mailbox's key.
 *
 * @see {@link predicate.the_ticket_is_being_prepared}
 */
export const the_ticket_is_being_prepared = predicate.the_ticket_is_being_prepared.brand();
/**
 * The ticket of this bond is ready: shown, and used by no one yet.
 *
 * @see {@link predicate.the_ticket_is_ready}
 */
export const the_ticket_is_ready = predicate.the_ticket_is_ready.brand();
/**
 * The ticket of this bond expired, used by no one.
 *
 * @see {@link predicate.the_ticket_has_expired}
 */
export const the_ticket_has_expired = predicate.the_ticket_has_expired.brand();
/**
 * The secret given is the ticket's (BND-9): my face's signature over the
 * ticket's mailbox address holds. The adapter verifies it with the safe's
 * pure function over the face's public key (`seals`' `dsl.the_signature_holds`).
 *
 * @see {@link predicate.the_secret_is_the_ticket_s}
 */
export const the_secret_is_the_ticket_s = predicate.the_secret_is_the_ticket_s.brand();
/**
 * The bond is with this face of theirs: their key is the one given.
 *
 * @see {@link predicate.the_bond_is_with_this_face}
 */
export const the_bond_is_with_this_face = predicate.the_bond_is_with_this_face.brand();
/**
 * My node has sent my introduction on this bond (BND-10).
 *
 * @see {@link predicate.my_introduction_is_sent}
 */
export const my_introduction_is_sent = predicate.my_introduction_is_sent.brand();
/**
 * A letter of theirs came on this bond: the confirmation is received (BND-5).
 *
 * @see {@link predicate.the_confirmation_is_received}
 */
export const the_confirmation_is_received = predicate.the_confirmation_is_received.brand();
/**
 * I opened their ticket on this bond within the window of a crossing of the
 * time their introduction declares (BND-10): the two tickets crossed, in
 * person. The time is theirs, a claim (PER-13).
 *
 * @see {@link predicate.i_opened_their_ticket_within_the_window_of_a_crossing_of}
 */
export const i_opened_their_ticket_within_the_window_of_a_crossing_of = predicate.i_opened_their_ticket_within_the_window_of_a_crossing_of.brand();
/**
 * Their introduction on this bond, come first, declares a time within the
 * window of a crossing of this instant, my opening their ticket (BND-10):
 * the two tickets crossed, in person.
 *
 * @see {@link predicate.their_introduction_is_declared_within_the_window_of_a_crossing_of}
 */
export const their_introduction_is_declared_within_the_window_of_a_crossing_of = predicate.their_introduction_is_declared_within_the_window_of_a_crossing_of.brand();

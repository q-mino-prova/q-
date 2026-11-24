// generated
// The values of `persona/self` from `value.ts` (DOM-25): the same objects under
// the same names, each schema with its output type under the same name, so that
// one import gives both. Only this module imports `value.ts`.
import { z } from 'zod';
import * as value from "./value.js";
/**
 * The name a face of hers is introduced as: "Anna".
 *
 * @see {@link value.face_name}
 */
export const face_name = value.face_name;
/**
 * The name she gives a bond: "Bru". Hers, on her phone only.
 *
 * @see {@link value.bond_name}
 */
export const bond_name = value.bond_name;
/**
 * A face's Ed25519 public key, 32 bytes in base64url with no padding: hers, or theirs on a bond.
 *
 * @see {@link value.face_key}
 */
export const face_key = value.face_key;
/**
 * Where a face of hers sits in her tree of faces (BND-3): at the top, or under another of her faces.
 *
 * @see {@link value.face_position}
 */
export const face_position = value.face_position;
/**
 * The address of a relay: an `https` URL, `https://relay.q-mino.test`.
 *
 * @see {@link value.relay_address}
 */
export const relay_address = value.relay_address;
/**
 * The relays of a mailbox: one in stage 1.
 *
 * @see {@link value.relays}
 */
export const relays = value.relays;
/**
 * A deposit address D, in the relay's form (MBX-1): base64url, at most 128 characters.
 *
 * @see {@link value.deposit_address}
 */
export const deposit_address = value.deposit_address;
/**
 * A mailbox: its D and its relays. Bruno's D_b, or hers for him, D_mb.
 *
 * @see {@link value.mailbox}
 */
export const mailbox = value.mailbox;
/**
 * The secret of a ticket (BND-9): 64 bytes in base64url, 86 characters.
 *
 * @see {@link value.ticket_secret}
 */
export const ticket_secret = value.ticket_secret;
/**
 * A ticket of someone else's, as she opens it (BND-10): Bruno's QR, Carla's
 * link. Their claims (F2): the face by its key and the name it is
 * introduced as, the mailbox of the bond to be, the secret.
 *
 * @see {@link value.their_ticket}
 */
export const their_ticket = value.their_ticket;
/**
 * Their face, on a bond: its key and the name it is introduced as.
 *
 * @see {@link value.their_face}
 */
export const their_face = value.their_face;
/**
 * In person, the crossed QR; at a distance, a link (BND-5).
 *
 * @see {@link value.handshake_way}
 */
export const handshake_way = value.handshake_way;
/**
 * How the bond was made, as her phone saw it (BND-5): in person or at a distance, and when.
 *
 * @see {@link value.handshake}
 */
export const handshake = value.handshake;
/**
 * Whether they have her (BND-5): awaited, or received, and when.
 *
 * @see {@link value.confirmation}
 */
export const confirmation = value.confirmation;
/**
 * A name in a manifest (EXT-3): what an extension sees, touches, an extension point's, a place's.
 *
 * @see {@link value.a_name}
 */
export const a_name = value.a_name;
/**
 * An extension's version: major, minor, patch.
 *
 * @see {@link value.extension_version}
 */
export const extension_version = value.extension_version;
/**
 * A major of an extension's surface (PER-17).
 *
 * @see {@link value.major}
 */
export const major = value.major;
/**
 * The majors of an extension's surface.
 *
 * @see {@link value.majors}
 */
export const majors = value.majors;
/**
 * A leaf of an extension, by its path from the persona's segment: `usecase/greet`.
 *
 * @see {@link value.a_leaf}
 */
export const a_leaf = value.a_leaf;
/**
 * An extension point, as she accepts it (EXT-16): an action, a slot or a page, by its name, in its place.
 *
 * @see {@link value.extension_point}
 */
export const extension_point = value.extension_point;
/**
 * An extension's manifest, as she is shown it and accepts it (EXT-7):
 * greetings 0.1.0, what it sees on `known`, what it touches, its extension
 * points, its leaves on `known`, the majors of its surfaces.
 *
 * @see {@link value.manifest}
 */
export const manifest = value.manifest;
/**
 * What an update asks more than the manifest she accepted (EXT-10).
 *
 * @see {@link value.more_asked}
 */
export const more_asked = value.more_asked;
/**
 * Whether an extension is active, not active, or waiting for her to accept what an update asks more (EXT-7).
 *
 * @see {@link value.extension_state}
 */
export const extension_state = value.extension_state;
/**
 * An extension her node offers a bond, with the majors of its surface on `known`: greetings, at major 1.
 *
 * @see {@link value.offered_extension}
 */
export const offered_extension = value.offered_extension;
/**
 * The extensions her node offers a bond, as she tells them when she asks (EXT-8): each named once.
 *
 * @see {@link value.offered_extensions}
 */
export const offered_extensions = value.offered_extensions;
/**
 * What came back of a question she asked a bond about the extensions in
 * common (EXT-8): nothing yet, the extensions in common (none, maybe), or no
 * answer, with why.
 *
 * @see {@link value.the_answer_about_the_extensions_in_common}
 */
export const the_answer_about_the_extensions_in_common = value.the_answer_about_the_extensions_in_common;
/**
 * A question she asked a bond about the extensions in common, when, and its answer (EXT-8, UI-5).
 *
 * @see {@link value.a_question_asked}
 */
export const a_question_asked = value.a_question_asked;

// The safe's pure functions over its values (DOM-5): the derivation of a
// face (SLIP-0010, the one construction of q-'s own), the deposit address of
// a collect secret, signing, verifying, sealing and opening, each over the
// primitives port, which the configurator gives (GR-5, GR-8, SEA-5). Usable
// by the adapters, the deliveries of the safe's effects and `post`.
// base64url, with no padding (RFC 4648 § 5): the domains have no `atob`.
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const groups_of = (items, size) => Array.from({ length: Math.ceil(items.length / size) }, (_, group) => items.slice(group * size, group * size + size));
/** Bytes told in base64url. */
export const base64url_of = (bytes) => groups_of([...bytes], 3)
    .map((group) => {
    const bits = group.reduce((sum, byte, at) => sum | (byte << (16 - 8 * at)), 0);
    return [18, 12, 6, 0]
        .slice(0, group.length + 1)
        .map((shift) => alphabet.charAt((bits >> shift) & 63))
        .join('');
})
    .join('');
/** The characters of a base64url text, each one code unit: its alphabet is ASCII. */
const the_characters_of = (text) => Array.from({ length: text.length }, (_, at) => text.charAt(at));
/** The bytes a base64url text tells: one of the safe's values, so of its alphabet. */
export const bytes_of = (text) => Uint8Array.from(groups_of(the_characters_of(text), 4).flatMap((group) => {
    const bits = group.reduce((sum, char, at) => sum | (alphabet.indexOf(char) << (18 - 6 * at)), 0);
    return [16, 8, 0].slice(0, group.length - 1).map((shift) => (bits >> shift) & 255);
}));
// SLIP-0010 over Ed25519 (SEA-2): hardened children only, one level, `m/i'`.
/** The key of the master's HMAC: the bytes of "ed25519 seed". */
const the_curve_s_seed_key = Uint8Array.from([
    0x65, 0x64, 0x32, 0x35, 0x35, 0x31, 0x39, 0x20, 0x73, 0x65, 0x65, 0x64,
]);
/** Where SLIP-0010's hardened indices start: 2³¹. */
const the_first_hardened_index = 2_147_483_648;
const halves_of = (digest) => ({
    key: digest.slice(0, 32),
    chain_code: digest.slice(32, 64),
});
/** An index as four bytes, the most significant first (SLIP-0010's ser32). */
const four_bytes_of = (index) => Uint8Array.from([24, 16, 8, 0].map((shift) => (index >>> shift) & 255));
const the_master_of = (primitives) => (seed) => halves_of(primitives.hmac_sha512(the_curve_s_seed_key, seed));
const the_hardened_child_of = (primitives) => (parent, index) => halves_of(primitives.hmac_sha512(parent.chain_code, Uint8Array.from([0, ...parent.key, ...four_bytes_of(the_first_hardened_index + index)])));
/**
 * The keys of the face at an index of a seed, by the scheme `slip10-flat`
 * (SEA-2): SLIP-0010's child `m/i'` over Ed25519, its key the private key,
 * the public key Ed25519's of it. The same seed and index give the same face:
 * the seed alone gives back every face, trying the indices in turn.
 */
export const the_face_at = (primitives) => (seed_secret, index) => {
    const child = the_hardened_child_of(primitives)(the_master_of(primitives)(bytes_of(seed_secret)), index);
    return {
        public_key: base64url_of(primitives.public_key_of(child.key)),
        private_key: base64url_of(child.key),
        chain_code: base64url_of(child.chain_code),
    };
};
/** The index of the first face of a seed. */
export const the_index_of_a_first_face = 0;
/** The index after one: a seed's indices are taken in turn, never twice (SEA-2). */
export const the_index_after = (index) => index + 1;
/** How many random bytes a seed and a collect secret are (A, 6 Nov 2026). */
export const the_length_of_a_secret = 32;
/**
 * What the safe's machine gives back for `draw_a_seed_for_the_face`
 * (SEA-3): a seed of random bytes, and its face at the first index.
 */
export const a_new_seed_and_its_first_face = (primitives) => {
    const seed_secret = base64url_of(primitives.random_bytes(the_length_of_a_secret));
    return {
        seed_secret: seed_secret,
        first_face: the_face_at(primitives)(seed_secret, the_index_of_a_first_face),
    };
};
/** The deposit address D of a collect secret R: BLAKE2b-256 of R, in base64url (SEA-4). */
export const the_deposit_address_of = (primitives) => (collect_secret) => base64url_of(primitives.blake2b_256(bytes_of(collect_secret)));
/** What the safe's machine gives back for `draw_the_mailbox_key` (SEA-4): R drawn at random, and its D. */
export const a_new_mailbox_key = (primitives) => {
    const collect_secret = base64url_of(primitives.random_bytes(the_length_of_a_secret));
    return {
        collect_secret: collect_secret,
        deposit_address: the_deposit_address_of(primitives)(collect_secret),
    };
};
/** A face's signature over a content (SEA-6): the calculation `the_signature_of_a_content`. */
export const the_signature_of = (primitives) => (private_key, content) => base64url_of(primitives.sign(bytes_of(private_key), bytes_of(content)));
/** Whether a signature is a public key's over a content (SEA-6): no secret, so anyone's to check. */
export const the_signature_holds = (primitives) => (public_key, content, signature) => primitives.signature_holds(bytes_of(public_key), bytes_of(content), bytes_of(signature));
/**
 * A content sealed for a public key (SEA-6): no secret, so anyone's to do;
 * not sealed for 32 bytes that are no key one can seal for (SEA-5). A peer's
 * key is a claim (F2): `post` reads the outcome.
 */
export const sealed_for = (primitives) => (public_key, content) => {
    const sealing = primitives.seal_for(bytes_of(public_key), bytes_of(content));
    return sealing.outcome === 'sealed'
        ? { outcome: 'sealed', sealed_content: base64url_of(sealing.sealed_content) }
        : { outcome: 'not_sealed' };
};
/** A sealed content tried with a face's private key (SEA-6): the calculation `the_sealed_content_opened`. */
export const opened_with = (primitives) => (private_key, sealed_content) => {
    const opening = primitives.open(bytes_of(private_key), bytes_of(sealed_content));
    return opening.outcome === 'opened'
        ? { outcome: 'opened', content: base64url_of(opening.content) }
        : { outcome: 'not_opened' };
};
// For the adapters: the predicates' values over the state, by the face and
// the mailbox key as they are kept.
export const a_face_is_there = (the_face) => the_face !== undefined;
export const the_face_is_being_made = (the_face) => the_face?.status === 'being_made';
export const a_mailbox_key_is_there = (the_key) => the_key !== undefined;
export const the_mailbox_key_is_being_drawn = (the_key) => the_key?.status === 'being_drawn';

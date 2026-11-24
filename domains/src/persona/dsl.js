// The pure functions of the persona base over its values, added at need. DOM-5
/**
 * The face that signed a letter and the mailbox of mine it came to, the key
 * of auth's lookups: Bruno's K_b at D_mb. The user and an anonymous letter
 * have none (D30): no lookup runs, the value is not known.
 */
export const a_face_at_my_mailbox = (context) => context.caller.is === 'a_face'
    ? {
        answer: 'known',
        value: { face: context.caller.key, mailbox: context.caller.to_my_mailbox },
    }
    : { answer: 'not_known' };
/** Who asks is the user of this node, from the app: Anna on her phone, never a letter. */
export const the_caller_is_the_user = (context) => context.caller.is === 'the_user';

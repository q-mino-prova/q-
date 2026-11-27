// The desk's pure functions over its values, added at need. DOM-5
/** The caller came with the collect secret of a mailbox, whichever. */
export const the_caller_shows_a_collect_secret = (caller) => caller.shows === 'a_collect_secret';
/** The collect secret the caller shows is the one of the mailbox at this address: D = hash(R) (PER-19). */
export const the_caller_holds_the_mailbox = (caller) => (deposit_address) => caller.shows === 'a_collect_secret' && caller.id === deposit_address;
/** The caller came with the signature of a stand's inviter, whichever stand (INV-5). */
export const the_caller_is_a_stand_s_inviter = (caller) => caller.shows === 'the_signature_of_a_stand_s_inviter';
/** The caller is the inviter of this stand: its signature verified with this stand's key (INV-5). */
export const the_caller_is_the_inviter_of = (caller) => (stand) => caller.shows === 'the_signature_of_a_stand_s_inviter' && caller.stand === stand;
/**
 * Why a leave was refused, from its failures (INV-2, INV-5): the time it
 * can be taken until, first, the inviter's own fault; then the stand's
 * room; any other failure (the stand not the inviter's), no reason.
 */
export const why_a_leave_is_refused = (failures) => {
    const the_stand_s = failures.every((failure) => failure.predicate === 'stand/invitations/predicate/the_stand_has_room' ||
        failure.predicate === 'stand/invitations/predicate/it_can_be_taken_until_then');
    if (!the_stand_s || failures.length === 0)
        return 'the_invitation_cannot_be_left';
    return failures.some((failure) => failure.predicate === 'stand/invitations/predicate/it_can_be_taken_until_then')
        ? 'not_takeable_then'
        : 'the_stand_is_full';
};

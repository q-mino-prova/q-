// The desk's pure functions over its values, added at need. DOM-5
/** The caller came with the collect secret of a mailbox, whichever. */
export const the_caller_shows_a_collect_secret = (caller) => caller.shows === 'a_collect_secret';
/** The collect secret the caller shows is the one of the mailbox at this address: D = hash(R) (PER-19). */
export const the_caller_holds_the_mailbox = (caller) => (deposit_address) => caller.shows === 'a_collect_secret' && caller.id === deposit_address;

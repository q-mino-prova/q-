// Persistent storage (WEB-11): the writer asks the browser to keep the node's
// storage, which it may otherwise clear when the device runs short of room.
// The browser decides, and its answer is shown (F6): it guarantees nothing.
/** Asks once per start of the writer; `persisted()` first, so a storage kept already asks nothing. */
export const ask_to_keep_the_storage = async (storage) => {
    if (storage === undefined)
        return 'not_told';
    try {
        if (await storage.persisted())
            return 'persistent';
        return (await storage.persist()) ? 'persistent' : 'best_effort';
    }
    catch {
        return 'not_told';
    }
};

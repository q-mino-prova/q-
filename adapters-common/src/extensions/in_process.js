/** A message as it crosses: a JSON value, copied. */
const copied = (message) => JSON.parse(JSON.stringify(message));
/** An error's message, or the value's text. */
const why = (error) => (error instanceof Error ? error.message : String(error));
/** The transport to an extension loaded in process (EXT-13): every message copied as JSON; its exceptions, its fall. */
export const in_process = (extension) => (to_the_kernel) => {
    let state = { side: 'coming', waiting: [] };
    const speaks = (message) => {
        if (state.side !== 'unloaded')
            to_the_kernel(copied(message));
    };
    const falls = (error) => {
        speaks({ message: 'fallen', why: why(error) });
    };
    const hands = (realm, message) => {
        realm.receive(copied(message)).catch(falls);
    };
    const arrives = (realm) => {
        if (state.side !== 'coming')
            return;
        const waiting = state.waiting;
        state = { side: 'here', realm };
        for (const message of waiting)
            hands(realm, message);
    };
    const loaded = extension(speaks);
    if (loaded instanceof Promise)
        loaded.then(arrives, falls);
    else
        arrives(loaded);
    return {
        to_the_extension: (message) => {
            switch (state.side) {
                case 'unloaded':
                    return;
                case 'coming':
                    state.waiting.push(message);
                    return;
                case 'here':
                    hands(state.realm, message);
            }
        },
        unload: () => {
            state = { side: 'unloaded' };
        },
    };
};

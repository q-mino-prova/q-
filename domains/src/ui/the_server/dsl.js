// The server, as sentences (UI-5): she reads it and goes on, to the start (her
// contacts, after her first face as from the menu).
import { _ui } from "./_scope_dsl.js";
/** The screen at its start. */
export const at_the_start = () => ({});
/** After what happens on the screen: on or back, the app starts again from what her node holds. */
export const after = (state, happens) => {
    switch (happens.happens) {
        case 'she_goes_on':
        case 'she_goes_back':
            return _ui.dsl.it_goes(state, { goes: 'to_the_start' });
    }
};
/** What the screen shows, given the relay of the configuration. */
export const what_it_shows = (_state, given) => ({ relay: given.relay });

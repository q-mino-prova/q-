// The extensions installed, as sentences (UI-5): she opens one.
import { _ui } from "./_scope_dsl.js";
/** The screen at its start. */
export const at_the_start = () => ({});
/** After what happens on the screen. */
export const after = (state, happens) => {
    switch (happens.happens) {
        case 'she_opens_an_extension':
            return _ui.dsl.it_goes(state, {
                goes: 'to_a_screen',
                screen: { screen: 'an_extension', extension: happens.extension },
            });
        case 'she_goes_back':
            return _ui.dsl.it_goes(state, { goes: 'back' });
    }
};
/** What the screen shows, given the extensions installed, by name. */
export const what_it_shows = (_state, extensions) => ({
    extensions: [...extensions]
        .sort((one, other) => (one.extension < other.extension ? -1 : 1))
        .map((one) => ({ extension: one.extension, version: one.version, is: one.is })),
});

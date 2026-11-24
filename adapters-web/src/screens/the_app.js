// What every screen is given by the rendering (UI-1, UI-3, ADP-7, WEB-4,
// WEB-5): her node, the device's sources (an id, the time, the camera), the
// count of her node's changes, which the screens follow to read it again,
// and the two hands of a turn: what it asks, handed to `user` in order, and
// where it goes, on the way. Since part 22.2 the words of each extension
// the kernel draws in its mark, and whether a screen is the one shown (a
// part of an extension is served only then, EXT-4, when one comes).
import { computed } from '@preact/signals';
import * as ui_value from '@q-mino/domains/ui/_value.ts';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
/** What a screen asked, drawn now: a new activity's id and the time (UI-3, WEB-4). */
export const what_it_asked_now = (device) => ui_value.what_it_asked.parse({ activity_id: device.draws_an_id(), at: device.clock.now() });
/** How an activity ended, in her words: its case, then what the kernel's leaf said when it has words for it. */
export const the_words_of_an_end = (common, how) => {
    // An extension's end has no kernel's words: told here with none of its own, the fault of its missing word (WEB-22).
    if (how.ended === 'the_extension_told_how_it_ended')
        return common.a_word_missing(how.said.event);
    const ended = common.how_it_ended[how.ended];
    if (how.ended === 'the_extension_cannot_be_reached')
        return `${ended}: ${common.cannot_be_reached[how.because]}`;
    if (how.ended === 'no_longer_followed')
        return ended;
    const said = common.the_kernels_events(how.said.event);
    return said === undefined ? ended : `${ended}: ${said}`;
};
/** A word of an extension, or the fault of its missing, by the name in the manifest it is for (WEB-22). */
export const the_word_or_its_fault = (common, word, name) => word ?? common.a_word_missing(name);
/**
 * A text that holds a word of an extension: written with it, or, missing,
 * the fault of its missing in place of the whole text (WEB-22).
 */
export const in_its_words = (common, word, name, text) => (word === undefined ? common.a_word_missing(name) : text(word));
/**
 * How an action of an extension ended, in her words (EXT-16): with what its
 * extension answered, its own words for its event, a fault when it has none
 * (WEB-22); else as any activity ends.
 */
export const the_words_of_an_actions_end = (common, words, how) => {
    if (how.ended !== 'the_extension_told_how_it_ended')
        return the_words_of_an_end(common, how);
    return the_word_or_its_fault(common, words?.events[how.said.event], how.said.event);
};
/** The app, given by the root to every screen (a context: static wiring, the same at every render). */
export const TheAppContext = createContext(undefined);
/** Whether the screen is the one shown, the last of the way (UI-1): told by the root to each screen it keeps. */
export const TheScreenIsShown = createContext(computed(() => false));
/** Whether this screen is the one shown. */
export const the_screen_is_shown = () => useContext(TheScreenIsShown);
/** The app the root gave this screen. */
export const the_app = () => {
    const app = useContext(TheAppContext);
    if (app === undefined)
        throw new Error('a screen outside the screens');
    return app;
};

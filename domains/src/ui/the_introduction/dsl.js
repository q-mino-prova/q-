// The introduction, as sentences (UI-6): she turns its cards one after the
// other; after the last, the first time, the server's screen, which goes on to
// the start; read again, back where she was. The first time she may skip the
// rest, on to the server.
import { _ui } from "./_scope_dsl.js";
/** The cards, in their order. */
const the_cards = [
    'what_cumino_is',
    'how_the_letters_travel',
    'the_extensions',
];
/** The screen at its start: the first card, read as its screen says. */
export const at_the_start = (read) => ({
    read,
    card: 'what_cumino_is',
});
const the_place_of = (card) => the_cards.indexOf(card);
/** Where the introduction ends: the server's screen the first time, back where she was again. */
const its_end = (state) => state.read === 'the_first_time'
    ? _ui.dsl.it_goes(state, { goes: 'to_a_screen', screen: { screen: 'the_server' } })
    : _ui.dsl.it_goes(state, { goes: 'back' });
/** After what happens on the screen. */
export const after = (state, happens) => {
    switch (happens.happens) {
        case 'she_turns_to_the_next_card': {
            const next = the_cards[the_place_of(state.card) + 1];
            return next === undefined ? its_end(state) : _ui.dsl.it_stays({ ...state, card: next });
        }
        case 'she_turns_to_the_card_before': {
            const before = the_cards[the_place_of(state.card) - 1];
            return _ui.dsl.it_stays(before === undefined ? state : { ...state, card: before });
        }
        case 'she_skips_it':
            return its_end(state);
        case 'she_goes_back':
            return _ui.dsl.it_goes(state, { goes: 'back' });
    }
};
/** What the screen shows. */
export const what_it_shows = (state) => {
    const place = the_place_of(state.card);
    const the_last = place === the_cards.length - 1;
    return {
        card: state.card,
        the_cards: [...the_cards],
        going_on: !the_last
            ? 'to_the_next_card'
            : state.read === 'the_first_time'
                ? 'to_the_server'
                : 'back_where_she_was',
        turning_back: place > 0 ? 'to_the_card_before' : 'none',
        skipping: state.read === 'the_first_time' && !the_last ? 'to_the_server' : 'none',
    };
};

import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// The introduction (UI-6): three cards that tell what Cumino is, turned one
// after the other; where she is among them; going on (the next card, the
// server the first time, back where she was again), the card before, and,
// the first time, skipping the rest. Back drawn only when read again: the
// first time the first face is behind her, as on the server's screen.
// [Q, C, 25 Nov 2026]
import * as the_introduction from '@q-mino/domains/ui/the_introduction/_dsl.ts';
import { Card, Flaw, Gesture, Icon, Screen } from "../design/index.js";
import { a_screen } from "./a_screen.js";
import { Back } from "./parts.js";
import { the_app } from "./the_app.js";
/** The glyph of each card. */
const the_glyph_of = {
    what_cumino_is: 'cumino',
    how_the_letters_travel: 'mail',
    the_extensions: 'puzzle',
};
export const TheIntroduction = (props) => {
    const app = the_app();
    const screen = a_screen(app, {
        at_the_start: () => the_introduction.at_the_start(props.screen.read),
        after: the_introduction.after,
    });
    const state = screen.state.value;
    const it = state === undefined ? undefined : the_introduction.what_it_shows(state);
    const taps = (happens) => ({
        does: 'taps',
        taps: () => {
            screen.happens(happens);
        },
    });
    const going_on = {
        to_the_next_card: props.texts.to_the_next_card,
        to_the_server: props.texts.to_the_server,
        back_where_she_was: props.texts.back_where_she_was,
    };
    const number = it === undefined ? 0 : it.the_cards.indexOf(it.card) + 1;
    return (_jsx(Screen, { title: props.texts.title, state: it?.card, back: props.screen.read === 'again' && (_jsx(Back, { onBack: () => {
                screen.happens({ happens: 'she_goes_back' });
            } })), gestures: it !== undefined && (_jsxs("div", { "data-part": "gestures", children: [it.turning_back === 'to_the_card_before' && (_jsx(Gesture, { kind: "secondary", glyph: "arrow_left", label: props.texts.to_the_card_before, does: taps({ happens: 'she_turns_to_the_card_before' }) })), it.skipping === 'to_the_server' && (_jsx(Gesture, { kind: "quiet", label: props.texts.skip, does: taps({ happens: 'she_skips_it' }) })), _jsx(Gesture, { kind: "primary", glyph: it.going_on === 'to_the_next_card' ? 'arrow_right' : 'check', label: going_on[it.going_on], does: taps({ happens: 'she_turns_to_the_next_card' }) })] })), children: it !== undefined && (_jsxs("div", { "data-part": "card", "data-state": it.card, children: [_jsxs(Card, { title: props.texts.the_cards[it.card].title, children: [_jsx("span", { "data-part": "glyph", children: _jsx(Icon, { glyph: the_glyph_of[it.card] }) }), props.texts.the_cards[it.card].says.map((paragraph) => (_jsx("p", { children: paragraph }, paragraph)))] }), it.card === 'how_the_letters_travel' && (_jsx(Flaw, { title: app.common.what_it_does_not_guarantee, children: props.texts.it_informs })), _jsx("ol", { "data-part": "cards", "aria-label": props.texts.where_she_is(number, it.the_cards.length), children: it.the_cards.map((card) => (_jsx("li", { "aria-current": card === it.card ? 'step' : undefined }, card))) })] })) }));
};

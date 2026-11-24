import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
// The server (UI-5; 1c of the notes on screens): informative, no choice. The
// relay of the configuration her letters go through, what it declares, what
// it sees and what it does not; shown once after her first face, read again
// from the menu; she goes on, to the start. Since the MVP's part 2 drawn with the
// design's components (WEB-29).
import * as the_server from '@q-mino/domains/ui/the_server/_dsl.ts';
import { Card, Flaw, Gesture, Screen } from "../design/index.js";
import { a_screen, what_it_is_given } from "./a_screen.js";
import { the_app } from "./the_app.js";
export const TheServer = (props) => {
    const app = the_app();
    const screen = a_screen(app, {
        at_the_start: the_server.at_the_start,
        after: the_server.after,
    });
    const given = what_it_is_given(app, screen.state, async () => ({
        relay: (await app.node.the_relay()).address,
    }));
    const state = screen.state.value;
    const read = given.value;
    const it = state === undefined || read === undefined
        ? undefined
        : the_server.what_it_shows(state, read.given);
    const taps = (does) => ({ does: 'taps', taps: does });
    return (_jsx(Screen, { title: props.texts.title, gestures: it !== undefined && (_jsx(Gesture, { kind: "primary", label: props.texts.go_on, does: taps(() => {
                screen.happens({ happens: 'she_goes_on' });
            }) })), children: it !== undefined && (_jsxs(_Fragment, { children: [_jsxs(Card, { children: [_jsx("p", { children: props.texts.it_carries_your_letters(it.relay) }), _jsx("p", { children: props.texts.it_sees }), _jsx("p", { children: props.texts.it_does_not_see })] }), _jsx(Flaw, { title: app.common.what_it_does_not_guarantee, children: props.texts.it_is_told_not_guaranteed })] })) }));
};

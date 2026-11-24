import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
// The server (UI-5; 1c of the notes on screens): informative, no choice. The
// relay of the configuration her letters go through, what it declares, what
// it sees and what it does not; shown once after her first face, read again
// from the menu; she goes on, to the start.
import * as the_server from '@q-mino/domains/ui/the_server/_dsl.ts';
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
    return (_jsxs("section", { "aria-label": props.texts.title, children: [_jsx("h1", { children: props.texts.title }), it !== undefined && (_jsxs(_Fragment, { children: [_jsx("p", { children: props.texts.it_carries_your_letters(it.relay) }), _jsx("p", { children: props.texts.it_sees }), _jsx("p", { children: props.texts.it_does_not_see }), _jsx("p", { children: props.texts.it_is_told_not_guaranteed }), _jsx("button", { type: "button", onClick: () => {
                            screen.happens({ happens: 'she_goes_on' });
                        }, children: props.texts.go_on })] }))] }));
};

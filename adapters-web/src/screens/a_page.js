import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import * as a_page from '@q-mino/domains/ui/a_page/_dsl.ts';
import { a_screen, kept, what_it_is_given } from "./a_screen.js";
import { APartNotDrawn, Back, TheMark } from "./parts.js";
import { the_app } from "./the_app.js";
export const APage = (props) => {
    const app = the_app();
    const opened = kept(() => props.screen);
    const screen = a_screen(app, {
        at_the_start: () => a_page.at_the_start(opened),
        after: a_page.after,
    });
    const given = what_it_is_given(app, screen.state, async () => {
        const [extensions, offers] = await Promise.all([
            app.node.the_extensions(),
            app.node.the_offers(),
        ]);
        return { extensions: [...extensions], offers };
    });
    const state = screen.state.value;
    const read = given.value;
    const shown = state === undefined || read === undefined ? undefined : a_page.what_it_shows(state, read.given);
    return (_jsxs("section", { "aria-label": props.texts.title, "data-state": shown?.shows, children: [_jsx(Back, { onBack: () => {
                    screen.happens({ happens: 'she_goes_back' });
                } }), _jsx("h1", { children: props.texts.title }), shown?.shows === 'no_longer_there' && _jsx("p", { children: props.texts.no_longer_there }), shown?.shows === 'the_part' && (_jsx(TheMark, { extension: shown.extension, children: _jsx(APartNotDrawn, {}) }))] }));
};

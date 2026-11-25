import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
import * as a_page from '@q-mino/domains/ui/a_page/_dsl.ts';
import { Corner, Notice, Screen } from "../design/index.js";
import { a_screen, kept, what_it_is_given } from "./a_screen.js";
import { APartNotDrawn, Back, TheMark } from "./parts.js";
import { the_app, the_word_or_its_fault } from "./the_app.js";
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
    return (_jsxs(Screen, { title: props.texts.title, state: shown?.shows, back: _jsx(Back, { onBack: () => {
                screen.happens({ happens: 'she_goes_back' });
            } }), children: [shown?.shows === 'no_longer_there' && (_jsx(Notice, { kind: "information", children: props.texts.no_longer_there })), shown?.shows === 'the_part' && (_jsxs(_Fragment, { children: [_jsx(Corner, { label: app.common.the_points.the_slot.who_has_the_screen, chain: [
                            the_word_or_its_fault(app.common, app.words(shown.extension)?.name, shown.extension),
                        ] }), _jsx(TheMark, { extension: shown.extension, children: _jsx(APartNotDrawn, {}) })] }))] }));
};

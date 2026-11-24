import { jsxs as _jsxs, jsx as _jsx } from "preact/jsx-runtime";
// The extensions installed (UI-5; EXT-7, EXT-10): each by its name, with its
// version and whether it is active, not active, or waiting for her to
// accept a new manifest; each opens its own screen. Since the MVP's part 2 drawn
// with the design's components (WEB-29).
import * as the_extensions from '@q-mino/domains/ui/the_extensions/_dsl.ts';
import { List, Row, Screen } from "../design/index.js";
import { a_screen, what_it_is_given } from "./a_screen.js";
import { Back } from "./parts.js";
import { the_app, the_word_or_its_fault } from "./the_app.js";
export const TheExtensions = (props) => {
    const app = the_app();
    const screen = a_screen(app, {
        at_the_start: the_extensions.at_the_start,
        after: the_extensions.after,
    });
    const given = what_it_is_given(app, screen.state, () => app.node.the_extensions());
    const state = screen.state.value;
    const read = given.value;
    const it = state === undefined || read === undefined
        ? undefined
        : the_extensions.what_it_shows(state, read.given);
    return (_jsx(Screen, { title: props.texts.title, back: _jsx(Back, { onBack: () => {
                screen.happens({ happens: 'she_goes_back' });
            } }), children: it !== undefined &&
            (it.extensions.length > 0 ? (_jsx(List, { label: props.texts.title, children: it.extensions.map((one) => (_jsx(Row, { glyph: "puzzle", title: the_word_or_its_fault(app.common, app.words(one.extension)?.name, one.extension), detail: _jsxs("span", { "data-part": "the-extension", "data-state": one.is, children: [props.texts.the_version(one.version), " ", props.texts.is[one.is]] }), opens: () => {
                        screen.happens({
                            happens: 'she_opens_an_extension',
                            extension: one.extension,
                        });
                    } }, one.extension))) })) : (_jsx("p", { children: props.texts.none }))) }));
};

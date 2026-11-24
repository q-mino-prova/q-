import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// The first face (UI-5, 1a): her name, kept as a draft as she types it; the
// button off with no name, making while the face is made.
import * as the_first_face from '@q-mino/domains/ui/the_first_face/_dsl.ts';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { TheCourse } from "./parts.js";
import { the_app, what_it_asked_now } from "./the_app.js";
export const TheFirstFace = (props) => {
    const app = the_app();
    const screen = a_screen(app, {
        at_the_start: async () => the_first_face.at_the_start(await app.node.a_draft({ for: 'the_name_of_my_first_face' })),
        after: the_first_face.after,
        told_the_end: (ended) => ended,
    });
    const given = what_it_is_given(app, screen.state, async (state) => state.asked === undefined ? undefined : app.node.an_activity(state.asked.asked.activity_id));
    const state = screen.state.value;
    const read = given.value;
    const it = state === undefined || read === undefined
        ? undefined
        : the_first_face.what_it_shows(state, read.given);
    return (_jsxs("section", { "aria-label": props.texts.title, children: [_jsx("h1", { children: props.texts.title }), it !== undefined && (_jsxs("form", { "data-state": it.the_button, onSubmit: (event) => {
                    event.preventDefault();
                    screen.happens({
                        happens: 'she_makes_the_face',
                        asked: what_it_asked_now(app.device),
                        face: app.device.draws_an_id(),
                    });
                }, children: [_jsxs("label", { children: [props.texts.your_name, ' ', _jsx("input", { name: "name", value: it.name, onInput: (event) => {
                                    screen.happens({ happens: 'she_types_the_name', name: event.currentTarget.value });
                                } })] }), _jsx("button", { type: "submit", disabled: it.the_button !== 'on', children: it.the_button === 'making' ? props.texts.making : props.texts.make_it }), _jsx(TheCourse, { course: it.course })] }))] }));
};

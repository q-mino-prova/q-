import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
// Mark (EXT-16, WEB-30): the kernel's mark of an extension, with an action
// of it beside a gesture of the kernel's; two marks, one inside the other,
// as an extension inside another's slot; the corner of a screen an
// extension holds, its name, or the chain of two.
import { Card, Corner, Gesture, Mark, Notice } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
const theirs = words.the_extensions_of_a_story;
const nothing = { does: 'taps', taps: () => undefined };
export default { title: 'Design/Mark', component: Mark };
/** On a contact: «Cambia nome» is the kernel's, «Ping» is in ping pong's mark, in its kind. */
export const a_mark_on_a_contact = {
    render: () => (_jsxs(_Fragment, { children: [_jsx(Card, { title: words.names[1], children: _jsx("p", { class: "gallery-row", children: _jsx(Gesture, { kind: "secondary", label: words.rename_it, glyph: "pencil", does: nothing }) }) }), _jsx(Mark, { name: "Ping pong", title: theirs.ping, children: _jsxs("div", { "data-part": "action", children: [_jsx(Gesture, { kind: "extension", label: "Ping", does: nothing }), _jsx(Notice, { kind: "information", children: "pong!" })] }) })] })),
};
export const two_marks_one_inside_the_other = {
    render: () => (_jsxs(Mark, { name: theirs.messages.name, title: words.the_mark_of(theirs.messages.name), children: [_jsx("p", { children: theirs.messages.said[0].words }), _jsx(Mark, { name: theirs.dice.name, title: words.the_mark_of(theirs.dice.name), children: _jsx("div", { "data-part": "action", children: _jsx(Gesture, { kind: "extension", label: theirs.dice.throw_them, does: nothing }) }) })] })),
};
export const the_corner_of_an_extension = {
    render: () => _jsx(Corner, { label: words.the_slot.who_has_the_screen, chain: ['Ping pong'] }),
};
export const the_corner_of_an_extension_inside_another = {
    render: () => (_jsx(Corner, { label: words.the_slot.who_has_the_screen, chain: [theirs.messages.name, theirs.dice.name], children: _jsx(Gesture, { kind: "quiet", label: words.the_slot.gives_it_back, glyph: "minimize_2", does: nothing }) })),
};

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
// Slot (EXT-16, WEB-30): a part of an extension's at a place, told its
// subject (here the contact Bruno), in its place and on the whole screen,
// with the chain of the marks around it in the corner; two extensions of
// the gallery only, Messaggi and Dadi, Dadi inside a slot of Messaggi's
// (no extension the app ships has a slot, WEB-23). The parts' own look is
// in the layer `extensions` (`gallery.css`), as an extension's would be.
import { Gesture, Mark, Slot } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
const theirs = words.the_extensions_of_a_story;
const nothing = { does: 'taps', taps: () => undefined };
const bruno = { name: words.names[1] };
/** Dadi's mark, its slot on the bond: a throw of the contact's. */
const TheDice = (props) => (_jsx(Mark, { name: theirs.dice.name, title: words.the_mark_of(theirs.dice.name), children: _jsx(Slot, { place: "a_bond", subject: bruno, label: theirs.dice.a_throw, words: words.the_slot, at_first: props.at_first ?? 'in_its_place', children: (contact) => (_jsxs("div", { class: "a-throw-of-a-story", children: [_jsx("p", { children: theirs.dice.thrown(contact.name, 5) }), _jsx(Gesture, { kind: "extension", label: theirs.dice.throw_them, does: nothing })] })) }) }));
/** Messaggi's mark, its slot on the bond: the conversation with the contact, and Dadi inside it. */
const TheMessages = (props) => (_jsx(Mark, { name: theirs.messages.name, title: words.the_mark_of(theirs.messages.name), children: _jsx(Slot, { place: "a_bond", subject: bruno, label: theirs.messages.the_conversation, words: words.the_slot, at_first: props.at_first ?? 'in_its_place', children: (contact) => (_jsxs(_Fragment, { children: [_jsx("ol", { class: "a-conversation-of-a-story", "aria-label": contact.name, children: theirs.messages.said.map((one, at) => (_jsx("li", { "data-by": one.by === contact.name ? 'them' : 'me', children: one.words }, at))) }), props.with_the_dice === true && _jsx(TheDice, { at_first: props.dice ?? 'in_its_place' })] })) }) }));
export default { title: 'Design/Slot', component: Slot };
export const a_slot_in_its_place = {
    render: () => _jsx(TheMessages, {}),
};
export const a_slot_on_the_whole_screen = {
    render: () => _jsx(TheMessages, { at_first: "on_the_whole_screen" }),
};
export const an_extension_inside_another = {
    render: () => _jsx(TheMessages, { with_the_dice: true }),
};
export const an_extension_inside_another_on_the_whole_screen = {
    render: () => (_jsx(TheMessages, { with_the_dice: true, at_first: "on_the_whole_screen", dice: "on_the_whole_screen" })),
};

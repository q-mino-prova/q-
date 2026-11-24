import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
// Question (WEB-27): a confirmation, which holds the screen (alone in the
// gallery's page, WEB-28), and a proposal, which stands beside it.
import { Gesture, Question } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
const taps = { does: 'taps', taps: () => undefined };
export default { title: 'Design/Question', component: Question };
export const a_confirmation = {
    render: () => (_jsx(Question, { kind: "confirmation", title: words.remove_it, declines: () => undefined, answers: _jsxs(_Fragment, { children: [_jsx(Gesture, { kind: "secondary", label: words.stop_renaming, does: taps }), _jsx(Gesture, { kind: "dangerous", label: words.remove_it, does: taps })] }), children: _jsx("p", { children: words.the_storage }) })),
};
export const a_proposal = {
    render: () => (_jsx(Question, { kind: "proposal", title: words.done, declines: () => undefined, answers: _jsx(Gesture, { kind: "primary", label: words.give_the_name, does: taps }), children: _jsx("p", { children: words.the_storage }) })),
};

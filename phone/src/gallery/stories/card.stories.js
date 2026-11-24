import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// Card (WEB-27): a part of a screen with its title, and without.
import { Card, Gesture, List, Row } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
const taps = { does: 'taps', taps: () => undefined };
export default { title: 'Design/Card', component: Card };
export const a_card_with_its_title = {
    render: () => (_jsxs(Card, { title: words.names[1], children: [_jsx(List, { children: _jsx(Row, { glyph: "hand_heart", title: words.a_handshake }) }), _jsx(Gesture, { kind: "secondary", label: words.rename_it, glyph: "pencil", does: taps })] })),
};
export const a_card_without_a_title = {
    render: () => (_jsx(Card, { children: _jsx("p", { children: words.the_storage }) })),
};

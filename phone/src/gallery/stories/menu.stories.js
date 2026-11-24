import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// Menu (WEB-27): its entries over the screen. Two menus open on one page
// close each other (a popover `auto`): the gallery shows one at a time.
import { Gesture, Menu } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
const taps = { does: 'taps', taps: () => undefined };
export default { title: 'Design/Menu', component: Menu };
export const an_open_menu = {
    render: () => (_jsxs(Menu, { label: words.contacts, closes: () => undefined, children: [_jsx(Gesture, { kind: "quiet", label: words.rename_it, glyph: "pencil", does: taps }), _jsx(Gesture, { kind: "quiet", label: words.remove_it, glyph: "x", does: taps })] })),
};

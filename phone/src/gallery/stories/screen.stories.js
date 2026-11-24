import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
// Screen (WEB-27): its areas, filled by the other components; with the strip over it.
import { Field, Flaw, Gesture, List, Notice, Row, Screen, Strip } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
const nothing = () => undefined;
const taps = { does: 'taps', taps: nothing };
export default { title: 'Design/Screen', component: Screen };
export const a_screen_of_contacts = {
    render: () => (_jsxs(Screen, { title: words.contacts, gestures: _jsx(Gesture, { kind: "primary", label: words.make_it, glyph: "plus", does: taps }), children: [_jsx(List, { label: words.contacts, children: words.names.map((name) => (_jsx(Row, { title: name, glyph: "user", detail: words.a_handshake, opens: nothing }, name))) }), _jsx(Flaw, { title: words.a_flaw_title, children: words.the_storage })] })),
};
export const a_screen_with_the_strip = {
    render: () => (_jsxs(Screen, { title: words.rename_it, strip: _jsx(Strip, { glyph: "wifi_off", children: words.no_network }), back: _jsx(Gesture, { kind: "quiet", label: words.back, glyph: "arrow_left", does: taps }), gestures: _jsxs(_Fragment, { children: [_jsx(Gesture, { kind: "primary", label: words.give_the_name, does: { does: 'submits' } }), _jsx(Gesture, { kind: "secondary", label: words.stop_renaming, does: taps })] }), children: [_jsx(Field, { label: words.the_name, name: "name", holds: { holds: 'the_screens', value: 'Bruno', types: nothing } }), _jsx(Notice, { kind: "waiting", children: words.waiting })] })),
};

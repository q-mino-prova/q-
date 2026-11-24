import { jsx as _jsx } from "preact/jsx-runtime";
// List and Row (WEB-27): rows plain, with a detail, opened, with gestures after, a long title.
import { Gesture, List, Row } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
const nothing = () => undefined;
export default { title: 'Design/List', component: List };
export const rows_she_opens = {
    render: () => (_jsx(List, { label: words.contacts, children: words.names.map((name) => (_jsx(Row, { title: name, glyph: "user", detail: words.a_handshake, opens: nothing }, name))) })),
};
export const rows_with_gestures = {
    render: () => (_jsx(List, { label: words.contacts, children: words.names.map((name) => (_jsx(Row, { title: name, glyph: "user", trail: _jsx(Gesture, { kind: "quiet", label: words.rename_it, glyph: "pencil", does: { does: 'taps', taps: nothing } }) }, name))) })),
};
export const plain_rows = {
    render: () => (_jsx(List, { children: words.names.map((name) => (_jsx(Row, { title: name }, name))) })),
};
export const a_long_title = {
    render: () => (_jsx(List, { children: _jsx(Row, { title: words.a_long_name, glyph: "user", detail: words.a_handshake, opens: nothing }) })),
};

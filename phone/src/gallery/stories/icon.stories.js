import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// Icon (WEB-27): every glyph, by its name; one named, as a screen reader hears it.
import { Icon, the_glyphs } from '@q-mino/adapters-web/design';
const the_names = Object.keys(the_glyphs).filter((name) => name in the_glyphs);
export default { title: 'Design/Icon', component: Icon };
export const every_glyph = {
    render: () => (_jsx("ul", { class: "gallery-swatches", children: the_names.map((name) => (_jsxs("li", { class: "gallery-row", children: [_jsx(Icon, { glyph: name }), _jsx("code", { children: name })] }, name))) })),
};
export const a_glyph_named = {
    render: () => (_jsx("p", { class: "gallery-row", children: _jsx(Icon, { glyph: "wifi_off", named: "Senza rete" }) })),
};

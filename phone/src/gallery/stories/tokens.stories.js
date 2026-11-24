import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// The tokens (WEB-26): every colour by its name, the type, the spaces.
// The swatches are drawn with the token they show, by name.
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples.the_tokens;
const the_colours = [
    'paper',
    'paper-raised',
    'paper-sunken',
    'ink',
    'ink-soft',
    'roan-line',
    'roan-edge',
    'cumin',
    'on-cumin',
    'cumin-ink',
    'danger',
    'fault',
    'waiting',
    'focus',
];
const the_texts = ['text-s', 'text-m', 'text-l', 'text-xl'];
const the_spaces = ['space-1', 'space-2', 'space-3', 'space-4', 'space-5', 'space-6'];
export default { title: 'Design/Tokens', component: undefined };
export const the_colours_of_the_theme = {
    render: () => (_jsx("section", { "aria-label": words.colours, children: _jsx("ul", { class: "gallery-swatches", children: the_colours.map((name) => (_jsxs("li", { children: [_jsx("span", { "data-part": "swatch", style: { background: `var(--${name})` } }), _jsxs("code", { children: ["--", name] })] }, name))) }) })),
};
export const the_type = {
    render: () => (_jsx("section", { "aria-label": words.type, children: the_texts.map((name) => (_jsxs("p", { style: { fontSize: `var(--${name})` }, children: [_jsxs("code", { children: ["--", name] }), " ", words.a_sentence] }, name))) })),
};
export const the_spaces_between = {
    render: () => (_jsx("section", { "aria-label": words.spaces, children: the_spaces.map((name) => (_jsxs("p", { class: "gallery-row", children: [_jsx("span", { style: {
                        inlineSize: `var(--${name})`,
                        blockSize: '1rem',
                        background: 'var(--cumin)',
                    } }), _jsxs("code", { children: ["--", name] })] }, name))) })),
};

import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Icon } from "./icon.js";
export const Corner = (props) => (_jsxs("aside", { class: "corner", "aria-label": props.label, children: [_jsx(Icon, { glyph: "puzzle" }), _jsx("ol", { "data-part": "chain", children: props.chain.map((name, at) => (_jsx("li", { children: name }, at))) }), props.children] }));

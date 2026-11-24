import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Icon } from "./icon.js";
export const Flaw = (props) => (_jsxs("aside", { class: "flaw", "aria-label": props.title, children: [_jsx(Icon, { glyph: "eye" }), _jsxs("div", { "data-part": "text", children: [_jsx("strong", { children: props.title }), _jsx("div", { children: props.children })] })] }));

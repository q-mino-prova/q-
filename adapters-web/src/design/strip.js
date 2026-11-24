import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Icon } from "./icon.js";
export const Strip = (props) => (_jsxs("p", { class: "strip", role: "status", children: [_jsx(Icon, { glyph: props.glyph }), props.children] }));

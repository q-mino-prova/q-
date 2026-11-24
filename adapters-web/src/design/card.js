import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
export const Card = (props) => (_jsxs("section", { class: "card", "aria-label": props.title, children: [props.title !== undefined && _jsx("h2", { children: props.title }), props.children] }));

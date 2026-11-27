import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Icon } from "./icon.js";
export const List = (props) => (_jsx("ul", { class: "list", "aria-label": props.label, children: props.children }));
export const Row = (props) => {
    const opens = props.opens;
    return (_jsxs("li", { class: "row", children: [props.glyph !== undefined && (_jsx("span", { "data-part": "lead", children: _jsx(Icon, { glyph: props.glyph }) })), _jsxs("div", { "data-part": "main", children: [opens === undefined ? (_jsx("span", { "data-part": "title", children: props.title })) : (_jsx("button", { type: "button", "data-part": "title", onClick: () => {
                            opens();
                        }, children: props.title })), props.detail !== undefined && ' ', props.detail !== undefined && _jsx("small", { "data-part": "detail", children: props.detail })] }), props.trail !== undefined && _jsx("div", { "data-part": "trail", children: props.trail }), props.below !== undefined && _jsx("div", { "data-part": "below", children: props.below })] }));
};

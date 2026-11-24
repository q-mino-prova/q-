import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Icon } from "./icon.js";
const the_glyph_of = {
    information: 'info',
    waiting: 'clock',
    done: 'check',
    fault: 'circle_alert',
};
export const Notice = (props) => (_jsxs("p", { class: "notice", "data-kind": props.kind, role: props.kind === 'fault' ? 'alert' : 'status', children: [_jsx(Icon, { glyph: the_glyph_of[props.kind] }), _jsx("span", { children: props.children })] }));

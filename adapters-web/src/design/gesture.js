import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Icon } from "./icon.js";
export const Gesture = (props) => {
    const does = props.does;
    return (_jsxs("button", { class: "gesture", "data-kind": props.kind, type: does.does === 'submits' ? 'submit' : 'button', disabled: props.off === true, onClick: does.does === 'taps'
            ? () => {
                does.taps();
            }
            : undefined, children: [props.kind === 'extension' ? (_jsx(Icon, { glyph: "puzzle" })) : (props.glyph !== undefined && _jsx(Icon, { glyph: props.glyph })), _jsx("span", { "data-part": "words", children: props.label })] }));
};

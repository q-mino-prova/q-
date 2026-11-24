import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
export const Field = (props) => {
    const tells = props.tells ?? { tells: 'nothing' };
    return (_jsxs("label", { class: "field", "data-state": tells.tells === 'a_fault' ? 'faulty' : 'fine', children: [_jsx("span", { "data-part": "label", children: props.label }), _jsx("input", { name: props.name, value: props.value, inputMode: props.keyboard ?? 'text', autocomplete: props.autocomplete ?? 'off', "aria-invalid": tells.tells === 'a_fault', onInput: (event) => {
                    props.types(event.currentTarget.value);
                } }), tells.tells === 'a_hint' && _jsx("small", { "data-part": "hint", children: tells.text }), tells.tells === 'a_fault' && (_jsx("small", { "data-part": "fault", role: "alert", children: tells.text }))] }));
};

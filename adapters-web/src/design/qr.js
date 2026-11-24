import { jsx as _jsx } from "preact/jsx-runtime";
// Qr (WEB-27): a QR she shows, large and centred, dark on its own white
// paper in both themes, with its quiet zone, as a camera reads it best.
// [Q, C, 24 Nov 2026]
export const Qr = (props) => (_jsx("figure", { class: "qr", children: _jsx("img", { alt: props.label, src: `data:image/svg+xml,${encodeURIComponent(props.svg)}` }) }));

import { jsx as _jsx } from "preact/jsx-runtime";
// Icon (WEB-27): a glyph of Lucide's, drawn in the colour of its text, as
// tall as its line. Decorative unless it is named: a glyph that stands alone
// for a word says that word to a screen reader. [Q, C, 24 Nov 2026]
import { the_glyphs } from "./glyphs.js";
const Shape = (props) => {
    const shape = props.shape;
    switch (shape.shape) {
        case 'path':
            return _jsx("path", { d: shape.d });
        case 'circle':
            return _jsx("circle", { cx: shape.cx, cy: shape.cy, r: shape.r });
        case 'rect':
            return (_jsx("rect", { x: shape.x, y: shape.y, width: shape.width, height: shape.height, rx: shape.rx, ry: shape.ry }));
        case 'line':
            return _jsx("line", { x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 });
        case 'polyline':
            return _jsx("polyline", { points: shape.points });
    }
};
export const Icon = (props) => {
    const shapes = the_glyphs[props.glyph];
    return (_jsx("svg", { class: "icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", focusable: "false", ...(props.named === undefined
            ? { 'aria-hidden': 'true' }
            : { role: 'img', 'aria-label': props.named }), children: shapes.map((shape, at) => (_jsx(Shape, { shape: shape }, at))) }));
};

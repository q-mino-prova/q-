import { jsx as _jsx } from "preact/jsx-runtime";
/** The glyphs of the chat, each its paths on a grid of 24. */
const the_glyphs = {
    send: [
        'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z',
        'm21.854 2.147-10.94 10.939',
    ],
    clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6v6l4 2'],
    check_check: ['M18 6 7 17l-5-5', 'm22 10-7.5 7.5L13 16'],
    circle_alert: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 8v4', 'M12 16h.01'],
    rotate: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
};
/** A glyph, in the colour of its text, hidden from a screen reader. */
export const Glyph = (props) => (_jsx("svg", { "data-part": "glyph", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false", children: the_glyphs[props.glyph].map((d) => (_jsx("path", { d: d }, d))) }));
/** The glyph beside a stage's words: a clock on its way, a double check delivered, an alert else. */
export const the_glyph_of = (stage) => {
    switch (stage.stage) {
        case 'on_its_way':
            return 'clock';
        case 'delivered':
            return 'check_check';
        case 'no_receipt':
        case 'could_not_be_delivered':
        case 'called_off':
        case 'held':
        case 'put_aside':
            return 'circle_alert';
    }
};

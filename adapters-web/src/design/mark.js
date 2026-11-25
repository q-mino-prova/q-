import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// Mark (EXT-16, WEB-30): the kernel's mark of an extension, around what
// comes from it at a place (its actions, slots and pages, its letters held):
// a frame of its own hue with the extension's tag on its edge, the puzzle
// glyph and its title, so that what is inside reads as the extension's,
// never as the kernel's. Marks nest (a slot of Messaggi holding the mark of
// another extension): each mark tells the points inside it which marks are
// around them (`TheMarksAround`), the chain the corner shows. Its look is
// the layer `frame`'s, last of all, so that no extension's style redraws it
// (WEB-26; the flaw: an integrated extension reaches the page's DOM and
// styles, the mark too, USR-7). [Q, C, 24 Nov 2026]
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { Icon } from "./icon.js";
/** The names of the extensions whose marks hold a point, the outermost first: the chain of a corner («Messaggi › Dadi»). */
export const TheMarksAround = createContext([]);
export const Mark = (props) => {
    const around = useContext(TheMarksAround);
    return (_jsxs("section", { class: "mark", "aria-label": props.title, children: [_jsxs("h2", { "data-part": "tag", children: [_jsx(Icon, { glyph: "puzzle" }), props.title] }), _jsx(TheMarksAround.Provider, { value: [...around, props.name], children: props.children })] }));
};

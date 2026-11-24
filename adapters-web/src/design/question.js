import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// Question (WEB-27): what the app asks her before it goes on, a `<dialog>`
// with its title, its words and her answers. Its kind says how it holds the
// screen: a `confirmation`, before a gesture that cannot be undone, holds
// it (modal: nothing else is tapped until she answers; Escape is her "no");
// a `proposal` (an update ready) stands beside it, and the screen goes on.
// Asked while it is drawn: the screen's state says whether it is (UI-1).
// [Q, C, 24 Nov 2026]
import { createContext } from 'preact';
import { useContext, useEffect, useRef } from 'preact/hooks';
/**
 * Whether a confirmation holds the whole page: it does in the app; in the
 * gallery, where many stories share a page, only a story shown alone
 * (WEB-28), so that one asked does not make the gallery inert.
 */
export const QuestionsHoldThePage = createContext(true);
export const Question = (props) => {
    const the_dialog = useRef(null);
    const declines = useRef(props.declines);
    declines.current = props.declines;
    const holds = useContext(QuestionsHoldThePage);
    const kind = props.kind;
    useEffect(() => {
        const dialog = the_dialog.current;
        if (dialog === null)
            return;
        const cancelled = (event) => {
            event.preventDefault();
            declines.current();
        };
        dialog.addEventListener('cancel', cancelled);
        if (kind === 'confirmation' && holds)
            dialog.showModal();
        else
            dialog.show();
        return () => {
            dialog.removeEventListener('cancel', cancelled);
            if (dialog.open)
                dialog.close();
        };
    }, []);
    return (_jsxs("dialog", { class: "question", "data-kind": props.kind, "aria-label": props.title, ref: the_dialog, children: [_jsx("h2", { children: props.title }), props.children, _jsx("div", { "data-part": "answers", children: props.answers })] }));
};

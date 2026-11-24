import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
// The parts the screens share (UI-1, UI-3, UI-4): the course of what a
// screen asked, told; the gesture back; since part 22.2 the kernel's mark of
// an extension and the points it holds at a place (EXT-16, WEB-22).
import * as ui from '@q-mino/domains/ui/_dsl.ts';
import { in_its_words, the_app, the_word_or_its_fault, the_words_of_an_actions_end, the_words_of_an_end, } from "./the_app.js";
/** The course of what a screen asked: nothing, in progress, or how it ended, in her words. */
export const TheCourse = (props) => {
    const app = the_app();
    switch (props.course.course) {
        case 'nothing_asked':
            return null;
        case 'in_progress':
            return (_jsx("p", { role: "status", "data-state": "in_progress", children: app.common.in_progress }));
        case 'ended':
            return (_jsx("p", { role: "status", "data-state": "ended", children: the_words_of_an_end(app.common, props.course.how) }));
    }
};
/** The gesture back. */
export const Back = (props) => {
    const app = the_app();
    return (_jsx("button", { type: "button", onClick: () => {
            props.onBack();
        }, children: app.common.back }));
};
/** The kernel's mark of an extension around what it holds (EXT-16): its name and a border. */
export const the_marks_style = { border: '2px solid', padding: '0.5em', margin: '0.5em 0' };
/**
 * The kernel's mark of an extension (EXT-16): a section with its name, from
 * its words, and a border, around what it holds; a name the app does not
 * have, drawn as a fault (WEB-22).
 */
export const TheMark = (props) => {
    const app = the_app();
    const title = in_its_words(app.common, app.words(props.extension)?.name, props.extension, app.common.the_mark_of);
    return (_jsxs("section", { "aria-label": title, style: the_marks_style, children: [_jsx("h2", { children: title }), props.children] }));
};
/** How an action's course is told beside it: in progress, or how it ended in its extension's words. */
const TheCourseOfAnAction = (props) => {
    const app = the_app();
    switch (props.course.course) {
        case 'nothing_asked':
            return null;
        case 'in_progress':
            return (_jsx("small", { role: "status", "data-state": "in_progress", children: app.common.in_progress }));
        case 'ended':
            return (_jsx("small", { role: "status", "data-state": "ended", children: the_words_of_an_actions_end(app.common, app.words(props.extension), props.course.how) }));
    }
};
/**
 * The points a mark holds at its place (UI-4, EXT-16, WEB-22): each action,
 * a gesture the kernel draws with the extension's label, off while its
 * activity is in progress, and how it ended in the extension's words; each
 * slot, what the app does not draw yet (`APartNotDrawn`); each page, the
 * gesture that opens it, by its label. A word the extension's words lack is
 * drawn as a fault, never silently its name.
 */
export const ThePoints = (props) => {
    const app = the_app();
    const words = app.words(props.mark.extension);
    return (_jsxs(_Fragment, { children: [props.mark.actions.map((action) => (_jsxs("p", { children: [_jsx("button", { type: "button", disabled: !ui.it_may_ask(props.course_of(action)), onClick: () => {
                            props.taps(action);
                        }, children: the_word_or_its_fault(app.common, words?.actions[action], action) }), ' ', _jsx(TheCourseOfAnAction, { extension: props.mark.extension, course: props.course_of(action) })] }, action))), props.mark.slots.map((slot) => (_jsx(APartNotDrawn, {}, slot))), props.mark.pages.length > 0 && (_jsx("ul", { children: props.mark.pages.map((page) => (_jsx("li", { children: _jsx("button", { type: "button", onClick: () => {
                            props.opens(page);
                        }, children: in_its_words(app.common, words?.pages[page], page, app.common.the_points.opens_the_page) }) }, page))) }))] }));
};
/**
 * A slot or a page of an extension, in its mark (EXT-16, WEB-23): a
 * component of the extension's in the kernel's mark, deferred until an
 * extension the app carries has one (ping pong has none). Until then the
 * app tells it does not have it, a fault of its composition, never a blank.
 * [Q, C, 24 Nov 2026]
 */
export const APartNotDrawn = () => {
    const app = the_app();
    return _jsx("p", { role: "alert", children: app.common.the_points.no_document });
};

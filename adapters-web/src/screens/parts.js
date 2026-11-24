import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
// The parts the screens share (UI-1, UI-3, UI-4): the course of what a
// screen asked, told; the gesture back; since part 22.2 the kernel's mark of
// an extension and the points it holds at a place (EXT-16, WEB-22); since
// the MVP's part 2 drawn with the design's components (WEB-27, WEB-29).
import { Gesture, List, Notice, Row } from "../design/index.js";
import * as ui from '@q-mino/domains/ui/_dsl.ts';
import { in_its_words, the_app, the_word_or_its_fault, the_words_of_an_actions_end, the_words_of_an_end, } from "./the_app.js";
/**
 * How an end is told, by its case (WEB-29): done, or done already, is
 * `done`; an answer that did not come, an end not followed, what cannot be
 * done and what the extension told are `information`, the normal outcomes
 * of a network of people (silence is one, never an error); what the app or
 * an extension could not do is a `fault`. [Q, C, 24 Nov 2026]
 */
export const the_kind_of_an_end = (how) => {
    switch (how.ended) {
        case 'done':
        case 'done_already':
            return 'done';
        case 'cannot_be_done':
        case 'no_longer_followed':
        case 'the_extension_told_how_it_ended':
            return 'information';
        case 'the_extension_cannot_be_reached':
        case 'the_app_cannot_do_it':
            return 'fault';
    }
};
/** The course of what a screen asked: nothing, in progress, or how it ended, in her words. */
export const TheCourse = (props) => {
    const app = the_app();
    switch (props.course.course) {
        case 'nothing_asked':
            return null;
        case 'in_progress':
            return _jsx(Notice, { kind: "waiting", children: app.common.in_progress });
        case 'ended':
            return (_jsx(Notice, { kind: the_kind_of_an_end(props.course.how), children: the_words_of_an_end(app.common, props.course.how) }));
    }
};
/** The gesture back. */
export const Back = (props) => {
    const app = the_app();
    return (_jsx(Gesture, { kind: "quiet", label: app.common.back, glyph: "arrow_left", does: {
            does: 'taps',
            taps: () => {
                props.onBack();
            },
        } }));
};
/**
 * The kernel's mark of an extension (EXT-16): a section with its name, from
 * its words, and a border, around what it holds; a name the app does not
 * have, drawn as a fault (WEB-22). Its look is the layer `frame`'s, last of
 * all (WEB-26; redrawn by the MVP's part 3).
 */
export const TheMark = (props) => {
    const app = the_app();
    const title = in_its_words(app.common, app.words(props.extension)?.name, props.extension, app.common.the_mark_of);
    return (_jsxs("section", { class: "mark", "aria-label": title, children: [_jsx("h2", { children: title }), props.children] }));
};
/** How an action's course is told beside it: in progress, or how it ended in its extension's words. */
const TheCourseOfAnAction = (props) => {
    const app = the_app();
    switch (props.course.course) {
        case 'nothing_asked':
            return null;
        case 'in_progress':
            return _jsx(Notice, { kind: "waiting", children: app.common.in_progress });
        case 'ended':
            return (_jsx(Notice, { kind: the_kind_of_an_end(props.course.how), children: the_words_of_an_actions_end(app.common, app.words(props.extension), props.course.how) }));
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
    return (_jsxs(_Fragment, { children: [props.mark.actions.map((action) => (_jsxs("div", { "data-part": "action", children: [_jsx(Gesture, { kind: "secondary", label: the_word_or_its_fault(app.common, words?.actions[action], action), off: !ui.it_may_ask(props.course_of(action)), does: {
                            does: 'taps',
                            taps: () => {
                                props.taps(action);
                            },
                        } }), _jsx(TheCourseOfAnAction, { extension: props.mark.extension, course: props.course_of(action) })] }, action))), props.mark.slots.map((slot) => (_jsx(APartNotDrawn, {}, slot))), props.mark.pages.length > 0 && (_jsx(List, { children: props.mark.pages.map((page) => (_jsx(Row, { glyph: "chevron_right", title: in_its_words(app.common, words?.pages[page], page, app.common.the_points.opens_the_page), opens: () => {
                        props.opens(page);
                    } }, page))) }))] }));
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
    return _jsx(Notice, { kind: "fault", children: app.common.the_points.no_document });
};

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
import * as an_extension from '@q-mino/domains/ui/an_extension/_dsl.ts';
import { Card, Gesture, Notice, Screen } from "../design/index.js";
import { a_screen, kept, what_it_is_given } from "./a_screen.js";
import { Back, TheCourse, TheMark, ThePoints } from "./parts.js";
import { in_its_words, the_app, the_word_or_its_fault, what_it_asked_now, } from "./the_app.js";
import { TheNews } from "./what_happened.js";
/** The plural of a point, as an extension's words name its labels (EXT-16). */
const the_labels_of = {
    action: 'actions',
    slot: 'slots',
    page: 'pages',
};
/** What an extension asks, in her words: a place by its label in the extension's words, or the fault of its missing (WEB-22). */
const the_words_of_what_it_asks = (texts, common, words, asks) => {
    switch (asks.asks) {
        case 'to_answer_your_bonds':
            return texts.to_answer_your_bonds(asks.leaves);
        case 'a_place_on_your_screens':
            return in_its_words(common, words?.[the_labels_of[asks.point]][asks.name], asks.name, (label) => texts.a_place_on_your_screens[asks.point](label, asks.place));
        case 'to_see_the_peers_key':
        case 'to_see_the_name_of_the_bond':
        case 'to_see_the_time_they_declare':
        case 'to_send_requests_on_your_bonds':
        case 'a_storage_of_its_own':
        case 'all_that_cumino_reaches':
        case 'its_parts_act_with_no_tap':
            return texts.what_it_asks[asks.asks];
    }
};
/** How much the gesture the screen allows weighs: the one that leads on is the primary; deactivating, or waiting, steps aside. */
const the_weight_of = (may) => may === 'activate' || may === 'accept_the_new_manifest' ? 'primary' : 'secondary';
const nothing_asked = { course: 'nothing_asked' };
/** The course of its activation or deactivation, the last she asked. */
/** The course of the last activity of an action of its mark (UI-3). */
const the_course_of_an_action = (shown, action) => shown.courses.filter((one) => one.for.for === 'an_action' && one.for.action === action).at(-1)
    ?.course ?? nothing_asked;
const the_course_of_its_state = (shown) => shown.courses
    .filter((one) => one.for.for === 'activating' || one.for.for === 'deactivating')
    .at(-1)?.course ?? nothing_asked;
export const AnExtension = (props) => {
    const app = the_app();
    const extension = kept(() => props.screen.extension);
    const screen = a_screen(app, {
        at_the_start: () => an_extension.at_the_start(extension),
        after: an_extension.after,
        told_the_end: (ended) => ended,
    });
    const given = what_it_is_given(app, screen.state, async (state) => {
        const [extensions, held_letters, happened, activities] = await Promise.all([
            app.node.the_extensions(),
            app.node.the_held_letters(),
            app.node.what_happened(),
            Promise.all(state.asked.map((one) => app.node.an_activity(one.asked.activity_id))),
        ]);
        return {
            extension: extensions.find((one) => one.extension === state.extension),
            held_letters: [...held_letters],
            happened: [...happened],
            activities: activities.filter((card) => card !== undefined),
        };
    });
    const the_manifest = () => given.value?.given.extension?.manifest;
    const may = (it) => {
        switch (it.may) {
            case 'activate':
            case 'accept_the_new_manifest':
                screen.happens({ happens: 'she_asks_to_activate_it' });
                return;
            case 'deactivate':
                screen.happens({ happens: 'she_deactivates_it', asked: what_it_asked_now(app.device) });
                return;
            case 'wait':
                return;
        }
    };
    const accepts = () => {
        const manifest = the_manifest();
        if (manifest === undefined)
            return;
        screen.happens({ happens: 'she_accepts', manifest, asked: what_it_asked_now(app.device) });
    };
    const state = screen.state.value;
    const read = given.value;
    const shown = state === undefined || read === undefined
        ? undefined
        : an_extension.what_it_shows(state, read.given);
    const manifest = the_manifest();
    const taps = (does) => ({ does: 'taps', taps: does });
    const the_notice_title = manifest === undefined
        ? undefined
        : in_its_words(app.common, app.words(manifest.name)?.name, manifest.name, (name) => props.texts.the_notice(name, manifest.version));
    return (_jsxs(Screen, { title: props.texts.title, state: shown?.shows, back: _jsx(Back, { onBack: () => {
                screen.happens({ happens: 'she_goes_back' });
            } }), children: [shown?.shows === 'no_such_extension' && (_jsx(Notice, { kind: "information", children: props.texts.no_such_extension })), shown?.shows === 'the_extension' && (_jsxs(_Fragment, { children: [_jsxs(Card, { title: the_word_or_its_fault(app.common, app.words(shown.extension)?.name, shown.extension), children: [_jsxs("p", { "data-part": "the-state", "data-state": shown.is, children: [_jsx("small", { children: props.texts.the_version(shown.version) }), ' ', _jsx("small", { children: props.texts.is[shown.is] })] }), _jsx("div", { "data-part": "gestures", children: _jsx("div", { "data-part": "may", "data-state": shown.may, children: _jsx(Gesture, { kind: the_weight_of(shown.may), label: props.texts.may[shown.may], off: shown.may === 'wait', does: taps(() => {
                                            may(shown);
                                        }) }) }) }), _jsx(TheCourse, { course: the_course_of_its_state(shown) })] }), shown.the_notice !== undefined && (_jsxs(Card, { ...(the_notice_title === undefined ? {} : { title: the_notice_title }), children: [_jsx("ol", { children: shown.the_notice.map((asks, index) => (_jsx("li", { children: the_words_of_what_it_asks(props.texts, app.common, app.words(shown.extension), asks) }, index))) }), _jsxs("div", { "data-part": "gestures", children: [_jsx(Gesture, { kind: "primary", label: props.texts.accept, does: taps(accepts) }), _jsx(Gesture, { kind: "secondary", label: props.texts.do_not_accept, does: taps(() => {
                                            screen.happens({ happens: 'she_does_not_accept' });
                                        }) })] })] })), _jsxs(TheMark, { extension: shown.extension, children: [shown.mark.points !== undefined && (_jsx(ThePointsOfItsMark, { shown: shown, points: shown.mark.points, happens: screen.happens })), shown.mark.held_letters.length + shown.mark.happened.length > 0 ? (_jsx(TheNews, { texts: props.texts.the_news, held_letters: shown.mark.held_letters, happened: shown.mark.happened, sends_again: (held) => {
                                    screen.happens({
                                        happens: 'she_sends_a_letter_again',
                                        held,
                                        asked: what_it_asked_now(app.device),
                                    });
                                }, puts_aside: (held, because) => {
                                    screen.happens({
                                        happens: 'she_puts_a_letter_aside',
                                        held,
                                        because,
                                        asked: what_it_asked_now(app.device),
                                    });
                                } })) : (_jsx("p", { children: props.texts.no_news }))] })] }))] }));
};
/** The points of its mark on its own screen, and her gestures on them. */
const ThePointsOfItsMark = (props) => {
    const app = the_app();
    return (_jsx(ThePoints, { mark: props.points, course_of: (action) => the_course_of_an_action(props.shown, action), taps: (action) => {
            props.happens({
                happens: 'she_taps_an_action',
                mark: props.points,
                action,
                asked: what_it_asked_now(app.device),
            });
        }, opens: (page) => {
            props.happens({ happens: 'she_opens_a_page', mark: props.points, page });
        } }));
};

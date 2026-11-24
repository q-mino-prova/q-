import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
// What happened (UI-5; F6, USR-8: nothing happens in silence; story 23 of
// `ui`'s README): what is in progress, each told by what she asked; the
// letters held and what happened without a fact, the kernel's by
// themselves, each extension's in the kernel's mark of it (EXT-16). A held
// letter she sends again, or puts aside with her reason. The news of a mark
// are drawn by `TheNews`, which an extension's own screen draws too. Since the MVP's
// part 2 drawn with the design's components (WEB-29).
import * as ui from '@q-mino/domains/ui/_dsl.ts';
import * as what_happened from '@q-mino/domains/ui/what_happened/_dsl.ts';
import { Card, Field, Gesture, List, Notice, Row, Screen } from "../design/index.js";
import { a_screen, what_it_is_given } from "./a_screen.js";
import { Back, TheCourse, TheMark } from "./parts.js";
import { the_app, what_it_asked_now } from "./the_app.js";
/** The detail of what happened, when its case has one. */
const the_detail = (texts, happened) => {
    switch (happened.happened) {
        case 'a_request_met_silence':
            return texts.the_silence_because[happened.because];
        case 'a_letter_was_refused':
            return happened.leaf === '' ? undefined : happened.leaf;
        case 'an_extension_fell':
            return texts.the_fall[happened.fall];
        case 'a_letter_could_not_be_opened':
        case 'a_response_came_unasked':
        case 'a_response_could_not_be_sent':
        case 'a_request_could_not_be_sent':
        case 'an_extension_did_what_it_does_not_declare':
        case 'a_request_was_not_answered':
            return undefined;
    }
};
/** What happened, in her words: its case, then its detail (as the end of an activity is told). */
export const the_words_of_what_happened = (texts, happened) => {
    const detail = the_detail(texts, happened);
    const told = texts.happened[happened.happened];
    return detail === undefined ? told : `${told}: ${detail}`;
};
/** The world's words of a letter that could not be delivered. */
const the_worlds_words = (held) => held.why.why === 'it_could_not_be_delivered' && held.why.because !== ''
    ? held.why.because
    : undefined;
/**
 * The news of the kernel or of a mark: its letters held, each sent again or
 * put aside with her reason, once at a time; what happened. The letters are
 * kept by their names, so that her reason, typed, stays while her node is
 * read again.
 */
export const TheNews = (props) => {
    const taps = (does) => ({ does: 'taps', taps: does });
    return (_jsxs(_Fragment, { children: [props.held_letters.length > 0 && (_jsxs(_Fragment, { children: [_jsx("h3", { children: props.texts.the_held_letters }), _jsx(List, { label: props.texts.the_held_letters, children: props.held_letters.map((one) => (_jsx(Row, { glyph: "clock", title: one.held.what, detail: _jsxs("span", { "data-part": "why", "data-state": one.held.why.why, children: [props.texts.why_it_is_held[one.held.why.why], _jsx(TheWorldsWords, { held: one.held })] }), trail: _jsxs(_Fragment, { children: [_jsx(Gesture, { kind: "secondary", glyph: "refresh_cw", label: props.texts.send_it_again, off: !ui.it_may_ask(one.course), does: taps(() => {
                                            props.sends_again(one.held);
                                        }) }), _jsxs("form", { onSubmit: (event) => {
                                            event.preventDefault();
                                            const because = new FormData(event.currentTarget).get('because');
                                            props.puts_aside(one.held, typeof because === 'string' ? because : '');
                                        }, children: [_jsx(Field, { label: props.texts.why_aside, name: "because", holds: { holds: 'the_forms' }, max_length: 1024 }), _jsx("div", { "data-part": "gestures", children: _jsx(Gesture, { kind: "secondary", label: props.texts.put_it_aside, off: !ui.it_may_ask(one.course), does: { does: 'submits' } }) })] }), _jsx(TheCourse, { course: one.course })] }) }, one.held.letter))) })] })), props.happened.length > 0 && (_jsxs(_Fragment, { children: [_jsx("h3", { children: props.texts.what_happened }), _jsx(List, { label: props.texts.what_happened, children: props.happened.map((one, index) => (_jsx(Row, { glyph: "info", title: the_words_of_what_happened(props.texts, one) }, index))) })] }))] }));
};
/** The world's words beside a letter that could not be delivered, none otherwise. */
const TheWorldsWords = (props) => {
    const because = the_worlds_words(props.held);
    return because === undefined ? null : _jsxs("span", { children: [" (", because, ")"] });
};
/** The activities a screen asked, as `user` reads them (none not read yet). */
const the_activities_asked = async (app, asked) => (await Promise.all(asked.map((one) => app.node.an_activity(one.asked.activity_id)))).filter((card) => card !== undefined);
export const WhatHappened = (props) => {
    const app = the_app();
    const screen = a_screen(app, {
        at_the_start: what_happened.at_the_start,
        after: what_happened.after,
        told_the_end: (ended) => ended,
    });
    const given = what_it_is_given(app, screen.state, async (state) => {
        const [in_progress, held_letters, happened, activities] = await Promise.all([
            app.node.the_activities_in_progress(),
            app.node.the_held_letters(),
            app.node.what_happened(),
            the_activities_asked(app, state.asked),
        ]);
        return {
            in_progress: [...in_progress],
            held_letters: [...held_letters],
            happened: [...happened],
            activities,
        };
    });
    const sends_again = (held) => {
        screen.happens({
            happens: 'she_sends_a_letter_again',
            held,
            asked: what_it_asked_now(app.device),
        });
    };
    const puts_aside = (held, because) => {
        screen.happens({
            happens: 'she_puts_a_letter_aside',
            held,
            because,
            asked: what_it_asked_now(app.device),
        });
    };
    const state = screen.state.value;
    const read = given.value;
    const shown = state === undefined || read === undefined
        ? undefined
        : what_happened.what_it_shows(state, read.given);
    return (_jsxs(Screen, { title: props.texts.title, state: shown?.shows, back: _jsx(Back, { onBack: () => {
                screen.happens({ happens: 'she_goes_back' });
            } }), children: [shown?.shows === 'nothing_happened' && (_jsx(Notice, { kind: "information", children: props.texts.nothing_happened })), shown?.shows === 'what_happened' && (_jsxs(_Fragment, { children: [shown.in_progress.length > 0 && (_jsx(Card, { title: props.texts.in_progress, children: _jsx(List, { children: shown.in_progress.map((card) => (_jsx(Row, { glyph: "clock", title: props.texts.the_activities[card.what.activity] }, card.activity_id))) }) })), shown.the_kernels.held_letters.length + shown.the_kernels.happened.length > 0 && (_jsx(Card, { title: props.texts.the_kernels, children: _jsx(TheNews, { texts: props.texts.the_news, held_letters: shown.the_kernels.held_letters, happened: shown.the_kernels.happened, sends_again: sends_again, puts_aside: puts_aside }) })), shown.in_their_marks.map((mark) => (_jsx(TheMark, { extension: mark.extension, children: _jsx(TheNews, { texts: props.texts.the_news, held_letters: mark.held_letters, happened: mark.happened, sends_again: sends_again, puts_aside: puts_aside }) }, mark.extension)))] }))] }));
};

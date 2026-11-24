import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
import * as ui from '@q-mino/domains/ui/_dsl.ts';
import * as a_contact from '@q-mino/domains/ui/a_contact/_dsl.ts';
import { Card, Field, Gesture, List, Notice, Question, Row, Screen, } from "../design/index.js";
import { a_screen, kept, what_it_is_given } from "./a_screen.js";
import { Back, TheCourse, TheMark, ThePoints } from "./parts.js";
import { the_app, the_word_or_its_fault, what_it_asked_now, } from "./the_app.js";
/** What came back of the last question, in her words: nothing when none was asked. */
const the_words_of_the_answer = (texts, common, words, answer) => {
    switch (answer.answer) {
        case 'not_asked':
            return undefined;
        case 'waiting':
            return texts.the_answer.waiting;
        case 'in_common':
            return texts.the_answer.in_common(answer.extensions.map((one) => the_word_or_its_fault(common, words(one)?.name, one)));
        case 'none_in_common':
            return texts.the_answer.none_in_common;
        case 'no_answer':
            return texts.the_answer.no_answer[answer.why];
    }
};
/**
 * How what came back is told (WEB-29): waiting while it travels; the
 * extensions in common, or none, or no answer, as information: silence is
 * a normal outcome, never an error. [Q, C, 24 Nov 2026]
 */
const the_kind_of_the_answer = (answer) => answer.answer === 'waiting' ? 'waiting' : 'information';
const nothing_asked = { course: 'nothing_asked' };
/** The course of the last activity asked for this, as `what_it_shows` tells it. */
const the_course_for = (shown, purpose) => shown.courses.filter((one) => JSON.stringify(one.for) === JSON.stringify(purpose)).at(-1)
    ?.course ?? nothing_asked;
export const AContact = (props) => {
    const app = the_app();
    const bond = kept(() => props.screen.bond);
    const screen = a_screen(app, {
        at_the_start: () => a_contact.at_the_start(bond),
        after: a_contact.after,
        told_the_end: (ended) => ended,
    });
    const given = what_it_is_given(app, screen.state, async (state) => {
        const [card, extensions, offered, activities, in_common] = await Promise.all([
            app.node.a_contact(bond),
            app.node.the_extensions(),
            app.node.offered_to(bond),
            Promise.all(state.asked.map((one) => app.node.an_activity(one.asked.activity_id))),
            app.node.the_extensions_in_common_with(bond),
        ]);
        return {
            card,
            extensions: [...extensions],
            offered,
            activities: activities.filter((one) => one !== undefined),
            in_common,
        };
    });
    /** She starts renaming it: with her draft, if one is kept, or the name she gives it. */
    const starts_renaming = async (name) => {
        const draft = await app.node.a_draft({ for: 'the_name_i_give_a_bond', bond });
        screen.happens({ happens: 'she_starts_renaming', name: draft ?? name });
    };
    const on_the_offer = (one) => {
        switch (one.may) {
            case 'offer':
                screen.happens({
                    happens: 'she_offers_an_extension',
                    extension: one.extension,
                    asked: what_it_asked_now(app.device),
                });
                return;
            case 'withdraw_the_offer':
                screen.happens({
                    happens: 'she_withdraws_the_offer',
                    extension: one.extension,
                    asked: what_it_asked_now(app.device),
                });
                return;
            case 'wait':
                return;
        }
    };
    /** She asks it for the extensions in common, with those her node offers it, as read. */
    const asks_for_the_extensions_in_common = () => {
        const read = given.value;
        if (read === undefined)
            return;
        screen.happens({
            happens: 'she_asks_for_the_extensions_in_common',
            offered: read.given.offered,
            asked: what_it_asked_now(app.device),
        });
    };
    const state = screen.state.value;
    const read = given.value;
    const shown = state === undefined || read === undefined
        ? undefined
        : a_contact.what_it_shows(state, read.given);
    return (_jsxs(Screen, { title: props.texts.title, state: shown?.shows, back: _jsx(Back, { onBack: () => {
                screen.happens({ happens: 'she_goes_back' });
            } }), children: [shown?.shows === 'no_such_contact' && (_jsx(Notice, { kind: "information", children: props.texts.no_such_contact })), shown?.shows === 'the_contact' && (_jsx(TheContact, { texts: props.texts, it: shown, happens: screen.happens, starts_renaming: starts_renaming, on_the_offer: on_the_offer, asks_for_the_extensions_in_common: asks_for_the_extensions_in_common }))] }));
};
/** The card of the contact, as `what_it_shows` tells it, and her gestures on it. */
const TheContact = (props) => {
    const app = the_app();
    const it = props.it;
    const said = the_words_of_the_answer(props.texts, app.common, app.words, it.in_common);
    const taps = (does) => ({ does: 'taps', taps: does });
    return (_jsxs(_Fragment, { children: [_jsxs(Card, { title: it.card.name, children: [_jsxs(List, { children: [it.card.introduced_as !== it.card.name && (_jsx(Row, { glyph: "user", title: props.texts.introduced_as(it.card.introduced_as) })), _jsx(Row, { glyph: it.card.handshake.way === 'in_person' ? 'hand_heart' : 'link', title: props.texts.the_handshake[it.card.handshake.way](props.texts.when(it.card.handshake.at, app.device.clock.time_zone)) }), _jsx(Row, { glyph: it.card.confirmation.state === 'received' ? 'check' : 'clock', title: props.texts.the_confirmation[it.card.confirmation.state] }), it.card.their_relays.length > 0 && (_jsx(Row, { glyph: "users", title: props.texts.their_relays, detail: it.card.their_relays.join(' · ') }))] }), it.renaming === undefined ? (_jsxs("div", { "data-part": "gestures", children: [_jsx(Gesture, { kind: "secondary", label: props.texts.rename_it, glyph: "pencil", does: taps(() => {
                                    void props.starts_renaming(it.card.name);
                                }) }), it.removing !== 'not_asked' ? null : (_jsx(Gesture, { kind: "dangerous", label: props.texts.remove_it, glyph: "x", does: taps(() => {
                                    props.happens({ happens: 'she_asks_to_remove_it' });
                                }) }))] })) : (_jsxs("form", { "data-state": it.renaming.the_button, onSubmit: (event) => {
                            event.preventDefault();
                            props.happens({
                                happens: 'she_renames_it',
                                asked: what_it_asked_now(app.device),
                            });
                        }, children: [_jsx(Field, { label: props.texts.the_name, name: "name", holds: {
                                    holds: 'the_screens',
                                    value: it.renaming.name,
                                    types: (name) => {
                                        props.happens({ happens: 'she_types_the_name', name });
                                    },
                                } }), _jsxs("div", { "data-part": "gestures", children: [_jsx(Gesture, { kind: "primary", label: it.renaming.the_button === 'renaming'
                                            ? props.texts.renaming
                                            : props.texts.give_the_name, off: it.renaming.the_button !== 'on', does: { does: 'submits' } }), _jsx(Gesture, { kind: "secondary", label: props.texts.stop_renaming, does: taps(() => {
                                            props.happens({ happens: 'she_stops_renaming' });
                                        }) })] })] })), _jsx(TheCourse, { course: the_course_for(it, { for: 'the_name' }) }), it.renaming !== undefined && it.removing === 'not_asked' && (_jsx("div", { "data-part": "gestures", children: _jsx(Gesture, { kind: "dangerous", label: props.texts.remove_it, glyph: "x", does: taps(() => {
                                props.happens({ happens: 'she_asks_to_remove_it' });
                            }) }) })), it.removing === 'to_confirm' && (_jsx(Question, { kind: "confirmation", title: props.texts.remove_it, declines: () => {
                            props.happens({ happens: 'she_keeps_it' });
                        }, answers: _jsxs(_Fragment, { children: [_jsx(Gesture, { kind: "secondary", label: props.texts.keep_it, does: taps(() => {
                                        props.happens({ happens: 'she_keeps_it' });
                                    }) }), _jsx(Gesture, { kind: "dangerous", label: props.texts.yes_remove_it, does: taps(() => {
                                        props.happens({
                                            happens: 'she_removes_it',
                                            asked: what_it_asked_now(app.device),
                                        });
                                    }) })] }), children: _jsx("p", { children: props.texts.remove_it_really(it.card.name) }) })), _jsx(TheCourse, { course: the_course_for(it, { for: 'removing' }) })] }), _jsxs(Card, { title: props.texts.the_extensions, children: [it.the_extensions.length > 0 ? (_jsx(List, { children: it.the_extensions.map((one) => (_jsx(Row, { glyph: "puzzle", title: the_word_or_its_fault(app.common, app.words(one.extension)?.name, one.extension), detail: _jsxs(_Fragment, { children: [one.offered ? props.texts.offered : props.texts.not_offered, _jsx(TheCourse, { course: the_course_for(it, {
                                            for: 'the_offer',
                                            extension: one.extension,
                                        }) })] }), trail: _jsx(Gesture, { kind: "secondary", label: props.texts.the_offer[one.may], off: one.may === 'wait', does: taps(() => {
                                    props.on_the_offer(one);
                                }) }) }, one.extension))) })) : (_jsx("p", { children: props.texts.no_extension_active })), _jsx("div", { "data-part": "gestures", children: _jsx(Gesture, { kind: "secondary", label: props.texts.ask_for_the_extensions_in_common, glyph: "refresh_cw", off: !ui.it_may_ask(the_course_for(it, { for: 'the_extensions_in_common' })), does: taps(props.asks_for_the_extensions_in_common) }) }), _jsx(TheCourse, { course: the_course_for(it, { for: 'the_extensions_in_common' }) }), said !== undefined && (_jsx("div", { "data-part": "the-answer", "data-state": it.in_common.answer, children: _jsx(Notice, { kind: the_kind_of_the_answer(it.in_common), children: said }) }))] }), it.marks.map((mark) => (_jsx(TheMark, { extension: mark.extension, children: _jsx(ThePoints, { mark: mark, course_of: (action) => the_course_for(it, {
                        for: 'an_action',
                        extension: mark.extension,
                        action,
                    }), taps: (action) => {
                        props.happens({
                            happens: 'she_taps_an_action',
                            mark,
                            action,
                            asked: what_it_asked_now(app.device),
                        });
                    }, opens: (page) => {
                        props.happens({ happens: 'she_opens_a_page', mark, page });
                    } }) }, mark.extension)))] }));
};

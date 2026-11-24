import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
import * as ui from '@q-mino/domains/ui/_dsl.ts';
import * as a_contact from '@q-mino/domains/ui/a_contact/_dsl.ts';
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
    return (_jsxs("section", { "aria-label": props.texts.title, "data-state": shown?.shows, children: [_jsx(Back, { onBack: () => {
                    screen.happens({ happens: 'she_goes_back' });
                } }), _jsx("h1", { children: props.texts.title }), shown?.shows === 'no_such_contact' && _jsx("p", { children: props.texts.no_such_contact }), shown?.shows === 'the_contact' && (_jsx(TheContact, { texts: props.texts, it: shown, happens: screen.happens, starts_renaming: starts_renaming, on_the_offer: on_the_offer, asks_for_the_extensions_in_common: asks_for_the_extensions_in_common }))] }));
};
/** The card of the contact, as `what_it_shows` tells it, and her gestures on it. */
const TheContact = (props) => {
    const app = the_app();
    const it = props.it;
    const said = the_words_of_the_answer(props.texts, app.common, app.words, it.in_common);
    return (_jsxs(_Fragment, { children: [_jsx("h2", { children: it.card.name }), it.card.introduced_as !== it.card.name && (_jsx("p", { children: props.texts.introduced_as(it.card.introduced_as) })), _jsx("p", { children: props.texts.the_handshake[it.card.handshake.way](props.texts.when(it.card.handshake.at, app.device.clock.time_zone)) }), _jsx("p", { "data-state": it.card.confirmation.state, children: props.texts.the_confirmation[it.card.confirmation.state] }), it.card.their_relays.length > 0 && (_jsxs(_Fragment, { children: [_jsx("p", { children: props.texts.their_relays }), _jsx("ul", { children: it.card.their_relays.map((relay) => (_jsx("li", { children: relay }, relay))) })] })), it.renaming === undefined ? (_jsx("button", { type: "button", onClick: () => {
                    void props.starts_renaming(it.card.name);
                }, children: props.texts.rename_it })) : (_jsxs("form", { "data-state": it.renaming.the_button, onSubmit: (event) => {
                    event.preventDefault();
                    props.happens({
                        happens: 'she_renames_it',
                        asked: what_it_asked_now(app.device),
                    });
                }, children: [_jsxs("label", { children: [props.texts.the_name, ' ', _jsx("input", { name: "name", value: it.renaming.name, onInput: (event) => {
                                    props.happens({
                                        happens: 'she_types_the_name',
                                        name: event.currentTarget.value,
                                    });
                                } })] }), _jsx("button", { type: "submit", disabled: it.renaming.the_button !== 'on', children: it.renaming.the_button === 'renaming'
                            ? props.texts.renaming
                            : props.texts.give_the_name }), _jsx("button", { type: "button", onClick: () => {
                            props.happens({ happens: 'she_stops_renaming' });
                        }, children: props.texts.stop_renaming })] })), _jsx(TheCourse, { course: the_course_for(it, { for: 'the_name' }) }), it.removing === 'not_asked' && (_jsx("button", { type: "button", onClick: () => {
                    props.happens({ happens: 'she_asks_to_remove_it' });
                }, children: props.texts.remove_it })), it.removing === 'to_confirm' && (_jsxs(_Fragment, { children: [_jsx("p", { children: props.texts.remove_it_really(it.card.name) }), _jsx("button", { type: "button", onClick: () => {
                            props.happens({
                                happens: 'she_removes_it',
                                asked: what_it_asked_now(app.device),
                            });
                        }, children: props.texts.yes_remove_it }), _jsx("button", { type: "button", onClick: () => {
                            props.happens({ happens: 'she_keeps_it' });
                        }, children: props.texts.keep_it })] })), _jsx(TheCourse, { course: the_course_for(it, { for: 'removing' }) }), _jsxs("section", { "aria-label": props.texts.the_extensions, children: [_jsx("h2", { children: props.texts.the_extensions }), it.the_extensions.length > 0 ? (_jsx("ul", { children: it.the_extensions.map((one) => (_jsxs("li", { "data-state": one.may, children: [the_word_or_its_fault(app.common, app.words(one.extension)?.name, one.extension), ' ', _jsx("small", { children: one.offered ? props.texts.offered : props.texts.not_offered }), ' ', _jsx("button", { type: "button", disabled: one.may === 'wait', onClick: () => {
                                        props.on_the_offer(one);
                                    }, children: props.texts.the_offer[one.may] }), _jsx(TheCourse, { course: the_course_for(it, {
                                        for: 'the_offer',
                                        extension: one.extension,
                                    }) })] }, one.extension))) })) : (_jsx("p", { children: props.texts.no_extension_active })), _jsx("button", { type: "button", disabled: !ui.it_may_ask(the_course_for(it, { for: 'the_extensions_in_common' })), onClick: props.asks_for_the_extensions_in_common, children: props.texts.ask_for_the_extensions_in_common }), _jsx(TheCourse, { course: the_course_for(it, { for: 'the_extensions_in_common' }) }), said !== undefined && (_jsx("p", { role: "status", "data-state": it.in_common.answer, children: said }))] }), it.marks.map((mark) => (_jsx(TheMark, { extension: mark.extension, children: _jsx(ThePoints, { mark: mark, course_of: (action) => the_course_for(it, {
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

import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { the_words_of_the_chat as words } from "../texts/it.js";
import { Glyph, the_glyph_of } from "./glyphs.js";
import { by_whom_and_when, the_day_in_words, the_day_key, the_stage_in_words, when_in_words, } from "./in_words.js";
import { the_hour_of } from "./the_phone.js";
import { a_chat_after, follows, in_its_order, invokes, it_may_be_sent_again, the_version, } from "./what_it_reads.js";
// The conversation (MSG-7, MSG-6, MSG-13; part M5): the chat on the whole
// screen, as a phone's messaging app draws one. It follows `a_chat` while it
// is shown (K-4), again each time it is shown again (G-2: a message held or
// put aside is told at its next showing); the messages in the order her
// node filed them (MSG-5), the newest at the bottom against the field, the
// older ones a page at a time as she goes up (the read gives the chat whole,
// K-9: the pages are the drawing's); each of hers with where it stands in
// words (MSG-13) and, when it was not delivered, «Invia di nuovo», the same
// text as a message of its own; each with its annotations at a tap (MSG-6);
// the field and «Invia» (`write_a_message`), the focus kept on the field;
// read up to the last of theirs shown once it is in view (`read_a_chat`, a
// part acting with no tap of hers, EXT-16); what comes told politely to a
// screen reader.
/** How many messages a page shows, the newest first. */
const a_page = 50;
/** A list of messages that is at its newest end, within a finger: a reversed column, whose bottom is 0. */
const at_the_newest = (messages) => messages !== null && Math.abs(messages.scrollTop) < 48;
/** A list of messages near its oldest end, where an older page is shown. */
const near_the_oldest = (messages) => messages.scrollHeight - messages.clientHeight - Math.abs(messages.scrollTop) < 96;
/** The first words of a text, for what a screen reader is told. */
const the_first_words = (text) => text.length > 120 ? `${text.slice(0, 120)}…` : text;
/**
 * What a screen reader is told of a change of the chat (politely, as it
 * comes): a message of theirs that came, or one of hers whose stage moved
 * from on its way; nothing at the first reading.
 */
const what_is_told = (before, after) => {
    if (before.read !== 'read' || after.read !== 'read')
        return [];
    const told = [];
    for (const message of in_its_order(after.messages)) {
        const was = before.messages.get(message.message_id);
        if (message.whose.whose === 'theirs') {
            if (was === undefined)
                told.push(words.announced.theirs(the_first_words(message.text)));
        }
        else if (message.whose.stage.stage !== 'on_its_way' &&
            (was?.whose.whose !== 'mine' || was.whose.stage.stage !== message.whose.stage.stage)) {
            told.push(words.announced.mine(words.the_stages[message.whose.stage.stage], the_first_words(message.text)));
        }
    }
    return told;
};
/** The annotations of a message (MSG-6, MSG-13): theirs what her node can tell of it; hers when written and where it stands. */
const TheAnnotations = (props) => {
    const its = words.the_annotations;
    const whose = props.message.whose;
    return (_jsx("dl", { id: props.id, "data-part": "annotations", hidden: !props.shown, children: whose.whose === 'theirs' ? (_jsxs(_Fragment, { children: [_jsx("dt", { children: its.received }), _jsx("dd", { children: its.received_by(when_in_words(props.message.at, props.phone)) }), _jsx("dt", { children: its.declared }), _jsx("dd", { children: its.declared_by(when_in_words(whose.declared_at, props.phone)) }), _jsx("dt", { children: its.signature }), _jsx("dd", { children: its.signature_valid }), _jsx("dt", { children: its.mailbox }), _jsx("dd", { children: its.the_bond_s_mailbox })] })) : (_jsxs(_Fragment, { children: [_jsx("dt", { children: its.written }), _jsx("dd", { children: when_in_words(props.message.at, props.phone) }), _jsx("dt", { children: its.stage }), _jsx("dd", { children: `${words.the_stages[whose.stage.stage]}: ${whose.stage.stage === 'on_its_way' && props.offline
                        ? its.why.on_its_way_with_no_network
                        : its.why[whose.stage.stage]}` }), 'at' in whose.stage && (_jsxs(_Fragment, { children: [_jsx("dt", { children: its.learned }), _jsx("dd", { children: its.learned_by(when_in_words(whose.stage.at, props.phone)) })] }))] })) }));
};
/** A message of the conversation: who and when for a screen reader, its text, its time and stage (its annotations at a tap), «Invia di nuovo» when it was not delivered. */
const AMessage = (props) => {
    const message = props.message;
    const whose = message.whose;
    const annotations = `the-chat-${props.bond}-${message.message_id}`;
    return (_jsxs("li", { "data-part": "a-message", "data-whose": whose.whose, "data-state": whose.whose === 'mine' ? whose.stage.stage : 'received', children: [props.day !== undefined && (_jsxs(_Fragment, { children: [_jsx("p", { "data-part": "day", "aria-hidden": "true", children: props.day }), ' '] })), _jsxs("div", { "data-part": "bubble", onClick: (event) => {
                    // A tap on the bubble opens its annotations, as its gesture does; not over the gesture, nor a selection.
                    const on = event.target;
                    if (on instanceof Element && on.closest('button, dl') !== null)
                        return;
                    if ((window.getSelection()?.toString() ?? '') !== '')
                        return;
                    props.toggles();
                }, children: [_jsxs("span", { "data-part": "for-a-screen-reader", children: [by_whom_and_when(message, props.phone), ": "] }), _jsx("p", { "data-part": "text", children: message.text }), ' ', _jsxs("button", { type: "button", "data-part": "meta", "aria-expanded": props.opened, "aria-controls": annotations, onClick: props.toggles, children: [_jsx("time", { dateTime: message.at, children: the_hour_of(new Date(message.at), props.phone.zone()) }), whose.whose === 'mine' && (_jsxs(_Fragment, { children: [' ', _jsxs("span", { "data-part": "stage", "data-state": whose.stage.stage, children: [_jsx(Glyph, { glyph: the_glyph_of(whose.stage) }), the_stage_in_words(whose.stage, props.offline)] })] })), _jsx("span", { "data-part": "for-a-screen-reader", children: `, ${words.the_conversation.details}` })] }), _jsx(TheAnnotations, { id: annotations, message: message, shown: props.opened, offline: props.offline, phone: props.phone })] }), whose.whose === 'mine' && it_may_be_sent_again(whose.stage) && (_jsxs("button", { type: "button", "data-part": "send-again", onClick: props.sends_again, children: [_jsx(Glyph, { glyph: "rotate" }), words.the_conversation.send_again] }))] }));
};
export const TheConversation = (props) => {
    const chat = useSignal({ read: 'reading' });
    const again = useSignal(0);
    const pages = useSignal(1);
    const written = useSignal('nothing');
    const opened = useSignal(undefined);
    const told = useSignal([]);
    const offline = useSignal(props.phone.offline());
    const the_messages = useRef(null);
    const the_field = useRef(null);
    const read_up_to = useRef(undefined);
    const reads = again.value;
    // Followed while shown, again once shown again (K-4, G-2).
    useEffect(() => {
        if (!props.shown)
            return;
        return follows(props.door, { use_case: 'usecase/a_chat', version: the_version, input: { bond: props.bond } }, (heard) => {
            const before = chat.peek();
            const after = a_chat_after(before, heard);
            chat.value = after.chat;
            const said = what_is_told(before, after.chat);
            if (said.length > 0) {
                const last = told.peek().at(-1)?.key ?? 0;
                told.value = [
                    ...told.peek(),
                    ...said.map((one, at) => ({ key: last + at + 1, said: one })),
                ].slice(-4);
            }
            if (after.then === 'reads_again')
                again.value += 1;
        });
    }, [props.shown, props.bond, reads]);
    useEffect(() => props.phone.when_the_network_changes(() => {
        offline.value = props.phone.offline();
    }), []);
    /** Read up to the last of theirs, once it is in view (MSG-7): with no tap of hers, each message once. */
    const marks_it_read = () => {
        const it = chat.peek();
        if (!props.shown || it.read !== 'read' || !at_the_newest(the_messages.current))
            return;
        const theirs = in_its_order(it.messages)
            .filter((one) => one.whose.whose === 'theirs')
            .at(-1);
        if (theirs === undefined || read_up_to.current === theirs.message_id)
            return;
        read_up_to.current = theirs.message_id;
        void invokes(props.door, {
            use_case: 'usecase/read_a_chat',
            version: the_version,
            input: { bond: props.bond, up_to: theirs.message_id },
        }).then((answered) => {
            const read = answered.answered === 'an_event' && answered.event === 'the_chat_is_read';
            if (!read && read_up_to.current === theirs.message_id)
                read_up_to.current = undefined;
        });
    };
    // After each drawing: what is in view is read.
    useEffect(() => {
        marks_it_read();
    });
    /** A message written on the bond (MSG-2): from the field, which empties at once and takes its text back if it was not written; or «Invia di nuovo». */
    const writes = (text, from) => {
        if (written.peek() === 'writing' || text.trim() === '')
            return;
        written.value = 'writing';
        if (from === 'the_field')
            props.text.value = '';
        // Her own message: the conversation goes to its newest end.
        if (the_messages.current !== null)
            the_messages.current.scrollTop = 0;
        void invokes(props.door, {
            use_case: 'usecase/write_a_message',
            version: the_version,
            input: { bond: props.bond, text },
        }).then((answered) => {
            const is_written = answered.answered === 'an_event' && answered.event === 'the_message_is_written';
            written.value = is_written ? 'nothing' : 'not_written';
            if (!is_written && from === 'the_field' && props.text.peek() === '')
                props.text.value = text;
        });
    };
    const it = chat.value;
    const all = it.read === 'read' ? in_its_order(it.messages) : [];
    const shown = all.slice(-a_page * pages.value);
    const offline_now = offline.value;
    const text = props.text.value;
    const blank = text.trim() === '';
    const content = (() => {
        switch (it.read) {
            case 'reading':
                return _jsx("p", { children: words.the_conversation.reading });
            case 'not_read':
                return (_jsxs(_Fragment, { children: [_jsx("p", { children: words.the_conversation.not_read }), _jsx("button", { type: "button", "data-part": "read-again", onClick: () => {
                                chat.value = { read: 'reading' };
                                again.value += 1;
                            }, children: words.the_conversation.read_again })] }));
            case 'read':
                if (all.length === 0)
                    return _jsx("p", { children: words.the_conversation.none });
                return (_jsxs(_Fragment, { children: [shown.length < all.length && (_jsx("button", { type: "button", "data-part": "older", onClick: () => {
                                pages.value += 1;
                            }, children: words.the_conversation.older })), _jsx("ol", { "aria-label": words.the_conversation.the_list, children: shown.map((message, at) => {
                                const before = shown[at - 1];
                                const day = the_day_key(message.at, props.phone);
                                return (_jsx(AMessage, { message: message, day: before === undefined || the_day_key(before.at, props.phone) !== day
                                        ? the_day_in_words(message.at, props.phone)
                                        : undefined, bond: props.bond, opened: opened.value === message.message_id, toggles: () => {
                                        opened.value =
                                            opened.peek() === message.message_id ? undefined : message.message_id;
                                    }, offline: offline_now, phone: props.phone, sends_again: () => {
                                        writes(message.text, 'a_message_not_delivered');
                                    } }, message.message_id));
                            }) })] }));
        }
    })();
    return (_jsxs("div", { class: "the-chat", "data-where": "on_the_whole_screen", "data-state": it.read, children: [_jsx("div", { "data-part": "messages", ref: the_messages, onScroll: (event) => {
                    const messages = event.currentTarget;
                    if (shown.length < all.length && near_the_oldest(messages))
                        pages.value += 1;
                    marks_it_read();
                }, children: _jsx("div", { "data-part": "all", children: content }) }), _jsxs("form", { "data-part": "field", onSubmit: (event) => {
                    event.preventDefault();
                    writes(props.text.peek(), 'the_field');
                    // The focus stays on the field after «Invia».
                    the_field.current?.focus();
                }, children: [offline_now && (_jsx("p", { "data-part": "note", "data-state": "no_network", children: words.the_field.no_network })), _jsx("p", { "data-part": "note", "data-state": written.value, role: "status", children: written.value === 'not_written' ? words.the_field.not_written : '' }), _jsxs("label", { children: [_jsx("span", { "data-part": "for-a-screen-reader", children: words.the_field.label }), _jsx("textarea", { ref: the_field, name: "the_message", rows: 1, maxLength: 4_000, placeholder: words.the_field.label, value: text, onInput: (event) => {
                                    props.text.value = event.currentTarget.value;
                                    if (written.peek() === 'not_written')
                                        written.value = 'nothing';
                                }, onKeyDown: (event) => {
                                    // Ctrl or ⌘ and Enter send, on a keyboard; Enter alone is a new line, as on a phone.
                                    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                                        event.preventDefault();
                                        event.currentTarget.form?.requestSubmit();
                                    }
                                } })] }), _jsxs("button", { type: "submit", "data-part": "send", disabled: blank || written.value === 'writing', 
                        // A tap on «Invia» leaves the focus on the field, the keyboard open.
                        onMouseDown: (event) => {
                            event.preventDefault();
                        }, children: [_jsx(Glyph, { glyph: "send" }), _jsx("span", { "data-part": "for-a-screen-reader", children: words.the_field.send })] })] }), _jsx("p", { "data-part": "for-a-screen-reader", role: "status", "aria-atomic": "false", children: told.value.map((one) => (_jsx("span", { children: `${one.said} ` }, one.key))) })] }));
};

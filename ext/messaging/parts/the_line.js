import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { the_words_of_the_chat as words } from "../texts/it.js";
import { Glyph, the_glyph_of } from "./glyphs.js";
import { when_in_a_line } from "./in_words.js";
import { a_glance_after, follows, the_version } from "./what_it_reads.js";
// The chat in its place (MSG-7, MSG-15; part M5): a line, on a contact's
// row in her contacts and under the slot's head on a contact's screen. It
// follows `a_chat_at_a_glance` while it is shown (EXT-16, K-4), again each
// time it is shown again (G-2: what it read is told anew), and tells the
// chat's last message, its first words, hers with where it stands, theirs
// with how many are to read («2 da leggere»), and when. It holds no gesture
// of its own: on a row the whole slot is the gesture to the whole screen
// (MSG-15), on a contact's screen the slot's head.
export const TheLine = (props) => {
    const glance = useSignal({ read: 'reading' });
    const again = useSignal(0);
    const reads = again.value;
    useEffect(() => {
        if (!props.shown)
            return;
        return follows(props.door, { use_case: 'usecase/a_chat_at_a_glance', version: the_version, input: { bond: props.bond } }, (told) => {
            const after = a_glance_after(glance.peek(), told);
            glance.value = after.glance;
            if (after.then === 'reads_again')
                again.value += 1;
        });
    }, [props.shown, props.bond, reads]);
    const it = glance.value;
    switch (it.read) {
        case 'reading':
            return _jsx("p", { class: "the-chat", "data-where": "in_its_place", "data-state": "reading" });
        case 'none':
            return (_jsx("p", { class: "the-chat", "data-where": "in_its_place", "data-state": "none", children: _jsx("span", { "data-part": "last", children: words.the_line.none }) }));
        case 'not_read':
            return (_jsx("p", { class: "the-chat", "data-where": "in_its_place", "data-state": "not_read", children: _jsx("span", { "data-part": "last", children: words.the_line.not_read }) }));
        case 'read': {
            const last = it.glance.the_last_message;
            const when = when_in_a_line(last.at, props.phone);
            return (_jsxs("p", { class: "the-chat", "data-where": "in_its_place", "data-state": "read", "data-to-read": it.glance.to_read > 0 ? 'some' : 'none', children: [_jsxs("span", { "data-part": "last", children: [last.whose.whose === 'mine' && _jsxs("span", { "data-part": "who", children: [words.the_line.mine, " "] }), last.text] }), ' ', _jsxs("span", { "data-part": "side", children: [last.whose.whose === 'mine' && (_jsxs(_Fragment, { children: [_jsxs("span", { "data-part": "stage", "data-state": last.whose.stage.stage, children: [_jsx(Glyph, { glyph: the_glyph_of(last.whose.stage) }), words.the_stages_in_a_line[last.whose.stage.stage]] }), ' '] })), it.glance.to_read > 0 && (_jsxs(_Fragment, { children: [_jsx("span", { "data-part": "to-read", children: words.the_line.to_read(it.glance.to_read) }), ' '] })), _jsx("time", { dateTime: last.at, children: when })] })] }));
        }
    }
};

import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
import { useSignal } from '@preact/signals';
import { its_look } from "./its_look.js";
import { TheConversation } from "./the_conversation.js";
import { TheLine } from "./the_line.js";
import { the_browser_s_phone } from "./the_phone.js";
// Messaging's part, the chat (MSG-7, MSG-15, EXT-16, K-3; part M5): the
// component its two slots show (`shows: 'parts/the_chat.js'`), on a bond's
// row in her contacts (`the_chat_in_my_contacts`) and on a bond's screen
// (`the_chat`), told the bond. In its place, the chat in a line (the last
// message, how many to read); on the whole screen, at her tap, the
// conversation, which writes and reads. Its follows run while it is shown
// and again when it is shown again (K-4, G-2); what she is writing stays
// while the part is drawn, in its place and on the whole screen alike (the
// slot is never drawn anew, WEB-30). It imports Preact and its signals,
// zod, `boundary`'s types and its own package (GR-10), and draws with plain
// elements and the design's variables. [Q, C, 27 Nov 2026]
/** The bond a part is told on a bond's screen and on its row; none on the extension's own, where messaging has no page (MSG-7). */
const the_bond_of = (placed) => placed.place === 'the_extension' ? undefined : placed.data.bond;
/** The chat on a phone: the part, its times in that phone's zone and clock, its network as that phone tells it. */
export const a_chat_part = (phone) => {
    const TheChat = (given) => {
        const text = useSignal('');
        const bond = the_bond_of(given.placed);
        return (_jsxs(_Fragment, { children: [_jsx("style", { children: its_look }), bond === undefined ? null : given.where === 'in_its_place' ? (_jsx(TheLine, { bond: bond, door: given.door, shown: given.shown, phone: phone })) : (_jsx(TheConversation, { bond: bond, door: given.door, shown: given.shown, phone: phone, text: text }))] }));
    };
    return TheChat;
};
/** The part the kernel draws (K-3): the chat on the browser's phone. */
export const part = a_chat_part(the_browser_s_phone);

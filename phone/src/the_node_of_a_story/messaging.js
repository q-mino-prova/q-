// Messaging in a story (MSG-7, K-3; part M5 of messaging): as the screens
// see it, active, its two slots (on a bond's screen and on its row in her
// contacts); its words, the phone's; its part, carried as the composition
// root carries it, on a phone of the story (Rome's zone, the story's clock,
// a network told); and the chats of a story, which answer its leaves on
// `self` as messaging would through the kernel's door: `a_chat` and
// `a_chat_at_a_glance` followed (the snapshot, then each change), `write_a_
// message` and `read_a_chat` invoked. The same for the screens' tests and
// the gallery's stories.
import * as ui_value from '@q-mino/domains/ui/_value.ts';
import * as user_value from '@q-mino/domains/user/_value.ts';
import messaging_manifest from '@q-mino/messaging/manifest.json' with { type: 'json' };
import { the_parts_carried } from "../the_parts.js";
import { texts } from "../texts/index.js";
import { ten_in_rome } from "./a_node_of_a_story.js";
/** Messaging as the screens see it: active or not, its manifest as she is shown it. */
export const messaging_seen = (is) => ui_value.an_extension_seen.parse({
    extension: 'messaging',
    version: '0.1.0',
    is,
    manifest: user_value.a_manifest.parse({
        name: 'messaging',
        version: '0.1.0',
        sees: { known: ['the_declared_time'] },
        touches: ['the_port_of_requests', 'its_storage'],
        extension_points: [
            { point: 'slot', name: 'the_chat', place: 'a_bond' },
            { point: 'slot', name: 'the_chat_in_my_contacts', place: 'a_bond_in_my_contacts' },
        ],
        leaves_on_known: ['usecase/message'],
        majors: { self: [1], known: [1] },
    }),
    what_it_asks: [{ asks: 'to_send_requests_on_your_bonds' }],
});
/** Messaging's words, the phone's (WEB-22). */
export const messaging_words = texts.screens.extensions.messaging;
/** A phone of a story: Saturday 21 November 2026, 10:00 in Rome; online, or with no network. */
export const a_phone_of_a_story = (network = 'online') => ({
    zone: () => 'Europe/Rome',
    now: () => new Date(ten_in_rome),
    offline: () => network === 'offline',
    when_the_network_changes: () => () => undefined,
});
/** Messaging carried with its part, on a phone of a story, as the composition root carries it (K-3). */
export const messaging_carried = (phone = a_phone_of_a_story()) => the_parts_carried([
    {
        manifest: messaging_manifest,
        realm: () => {
            throw new Error('a story hosts no extension');
        },
        parts: {
            'parts/the_chat.js': async () => {
                const its_module = await import('@q-mino/messaging/parts/the_chat.js');
                return { part: its_module.a_chat_part(phone) };
            },
        },
    },
]);
/** An instant of the story, minutes after (or before) its ten o'clock in Rome. */
export const minutes_after_ten = (minutes) => new Date(Date.parse(ten_in_rome) + minutes * 60_000).toISOString();
/** A message of hers in a story. */
export const mine = (message_id, place, text, at, stage = { stage: 'on_its_way' }) => ({ message_id, place, text, at, whose: { whose: 'mine', stage } });
/** A message of theirs in a story, its declared time its arrival's unless the story says. */
export const theirs = (message_id, place, text, at, declared_at = at) => ({ message_id, place, text, at, whose: { whose: 'theirs', declared_at } });
const the_same = (one, other) => JSON.stringify(one) === JSON.stringify(other);
/** A field of an input given as data (JSON). */
const the_field = (input, name) => typeof input === 'object' && input !== null
    ? Object.entries(input).find(([key]) => key === name)?.[1]
    : undefined;
/** A chat at a glance, as `a_chat_at_a_glance` gives it: none before the first message. */
const at_a_glance = (chat) => {
    const last = chat.messages.at(-1);
    if (last === undefined)
        return [];
    const to_read = chat.messages.filter((one) => one.whose.whose === 'theirs' && one.place > chat.read_up_to).length;
    return [{ bond: chat.bond, the_last_message: last, to_read }];
};
/** The entries of `a_chat`, the newest first. */
const the_entries = (chat) => [...chat.messages].sort((one, other) => other.place - one.place);
/** The chats of a story, from what they hold at its start; Bruno's bond `L_b` if none is named. */
export const the_chats_of_a_story = (at_the_start) => {
    let chats = [...at_the_start];
    let asked = [];
    let waiting = [];
    let written = 0;
    const tell = () => {
        const now = waiting;
        waiting = [];
        for (const resolve of now)
            resolve();
    };
    const a_change = () => new Promise((resolve) => {
        waiting = [...waiting, resolve];
    });
    const the_chat_of = (bond) => chats.find((one) => one.bond === bond) ?? { bond, messages: [], read_up_to: 0 };
    const change = (bond, changed) => {
        const next = changed(the_chat_of(bond));
        chats = [...chats.filter((one) => one.bond !== bond), next];
        tell();
    };
    /** A read followed: its snapshot, then each entry that changed, entered or left, by its identity. */
    async function* followed(entries, identity) {
        let before = entries();
        let position = 1;
        yield { event: 'snapshot', entries: before, position: String(position) };
        for (;;) {
            await a_change();
            const now = entries();
            position += 1;
            for (const one of now) {
                const was = before.find((other) => identity(other) === identity(one));
                if (was === undefined)
                    yield {
                        event: 'entered',
                        position: String(position),
                        identity: identity(one),
                        entry: one,
                    };
                else if (!the_same(was, one))
                    yield { event: 'fact', position: String(position), identity: identity(one), entry: one };
            }
            for (const was of before)
                if (!now.some((one) => identity(one) === identity(was)))
                    yield { event: 'left', position: String(position), identity: identity(was) };
            before = now;
        }
    }
    async function* answers(served) {
        if (served.invokes.extension !== 'messaging')
            return;
        asked = [...asked, { use_case: served.invokes.use_case, input: served.input }];
        const bond = the_field(served.input, 'bond');
        if (typeof bond !== 'string')
            return;
        switch (served.invokes.use_case) {
            case 'usecase/a_chat':
                yield* followed(() => the_entries(the_chat_of(bond)), (one) => one.message_id);
                return;
            case 'usecase/a_chat_at_a_glance':
                yield* followed(() => at_a_glance(the_chat_of(bond)), (one) => one.bond);
                return;
            case 'usecase/write_a_message': {
                const text = the_field(served.input, 'text');
                if (typeof text !== 'string')
                    return;
                written += 1;
                const message_id = `M-${String(written)}`;
                change(bond, (chat) => ({
                    ...chat,
                    messages: [
                        ...chat.messages,
                        mine(message_id, chat.messages.length + 1, text, minutes_after_ten(written)),
                    ],
                }));
                yield { event: 'the_message_is_written', payload: { message_id } };
                return;
            }
            case 'usecase/read_a_chat': {
                const up_to = the_field(served.input, 'up_to');
                const read = the_chat_of(bond).messages.find((one) => one.message_id === up_to);
                if (read === undefined) {
                    yield { event: 'the_chat_cannot_be_read', payload: {} };
                    return;
                }
                change(bond, (chat) => ({ ...chat, read_up_to: Math.max(chat.read_up_to, read.place) }));
                yield { event: 'the_chat_is_read', payload: {} };
                return;
            }
        }
    }
    return {
        holds: () => chats,
        change,
        answers,
        asked: () => asked,
    };
};

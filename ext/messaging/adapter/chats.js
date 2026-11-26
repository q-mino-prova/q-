import * as zz from '@q-mino/domains/library';
import { a_message_is_there, an_empty_folder, as_a_message_of_a_chat, closed_with, it_is_read_up_to, read_up_to, the_last_of, the_message_waits, the_next_place, to_read, what_came_back_is, with_one_more, } from "../business/chats/_dsl.js";
import { a_chat_s_folder, a_message_in_a_chat, } from "../business/chats/_value.js";
import { selection_operators, the_entry_of_a_held, the_executor_s, } from "./partition.js";
// The state of `chats` in its partition (EXT-14; MSG-1..MSG-7, MSG-13; part
// M2): each chat's folder under its bond (`state/chat/<bond>/`), its folder
// record (`…/folder`: how many messages filed, how far she read) and its
// messages by their identity (`…/message/<id>`), each at its place, so that
// a chat reads as one range; its predicates' fragments and its facts' writes
// over them, the meanings from the business's `dsl` (DOM-5); its reads'
// sources, a chat's messages and a chat at a glance, the stage of her
// messages told with what the executor holds of their delivery (MSG-13).
// The four predicates over what came back read no key: they hold on the
// return's input, as ping pong's (PNG-6). The bond and the message are
// written in a key as `encodeURIComponent` writes them, so that no `/` of
// an opaque identity opens a range of another chat.
/** The effect whose letters the executor holds: the delivery of a message. */
const the_effect = 'business/chats/effect/deliver_a_message';
/** A segment of a key, an identity written so that it holds no `/`. */
const segment = (identity) => encodeURIComponent(identity);
/** The folder of a bond's chat: every key of it under this range. */
export const the_chat_of = (bond) => `state/chat/${segment(bond)}/`;
/** The record of a chat's folder. */
const the_folder = (bond) => `${the_chat_of(bond)}folder`;
/** The key of a message filed in a chat. */
const the_message = (bond, message_id) => `${the_chat_of(bond)}message/${segment(message_id)}`;
/** Every chat. */
const every_chat = 'state/chat/';
/** The chat's folder kept at its key, parsed as the business's record. */
const folder_in = (seen, bond) => {
    const found = seen(the_folder(bond));
    return found === undefined ? undefined : a_chat_s_folder.parse(found);
};
/** The message kept at its key, parsed as the business's record. */
const message_in = (seen, bond, message_id) => {
    const found = seen(the_message(bond, message_id));
    return found === undefined ? undefined : a_message_in_a_chat.parse(found);
};
/** A message filed in its chat at the next place, and the folder with one more (MSG-5). */
const filing = (bond, message_id, as_filed) => ({
    reads: [the_folder(bond)],
    writes: (seen) => {
        const folder = folder_in(seen, bond) ?? an_empty_folder(bond);
        return [
            {
                write: 'set',
                key: the_message(bond, message_id),
                value: zz.as_json(as_filed(the_next_place(folder))),
            },
            { write: 'set', key: the_folder(bond), value: zz.as_json(with_one_more(folder)) },
        ];
    },
});
/** A message closed with what came back, when her node learned it: the record rewritten, none if it is not filed. */
const closing = (meaning) => (fact) => ({
    reads: [the_message(fact.bond, fact.message_id)],
    writes: (seen) => {
        const before = message_in(seen, fact.bond, fact.message_id);
        return before === undefined
            ? []
            : [
                {
                    write: 'set',
                    key: the_message(fact.bond, fact.message_id),
                    value: zz.as_json(closed_with(meaning, fact.at)(before)),
                },
            ];
    },
});
/** A fact that changes nothing (DOM-6): it reads and writes nothing. */
const nothing = () => ({ reads: [], writes: () => [] });
export const chats_fragments = {
    'business/chats/predicate/a_message_has_this_id': (p) => ({
        reads: [the_message(p.bond, p.message_id)],
        holds: (seen) => a_message_is_there(message_in(seen, p.bond, p.message_id)),
    }),
    'business/chats/predicate/the_message_waits': (p) => ({
        reads: [the_message(p.bond, p.message_id)],
        holds: (seen) => the_message_waits(message_in(seen, p.bond, p.message_id)),
    }),
    'business/chats/predicate/the_message_was_received': (p) => ({
        reads: [],
        holds: () => what_came_back_is('the_message_was_received')(p.what_came_back),
    }),
    'business/chats/predicate/the_message_had_no_receipt': (p) => ({
        reads: [],
        holds: () => what_came_back_is('the_message_had_no_receipt')(p.what_came_back),
    }),
    'business/chats/predicate/the_peer_cannot_receive_it': (p) => ({
        reads: [],
        holds: () => what_came_back_is('the_peer_cannot_receive_it')(p.what_came_back),
    }),
    'business/chats/predicate/the_message_was_called_off': (p) => ({
        reads: [],
        holds: () => what_came_back_is('the_message_was_called_off')(p.what_came_back),
    }),
    'business/chats/predicate/the_chat_is_read_up_to_it': (p) => ({
        reads: [the_folder(p.bond), the_message(p.bond, p.message_id)],
        holds: (seen) => it_is_read_up_to(folder_in(seen, p.bond), message_in(seen, p.bond, p.message_id)),
    }),
};
export const chats_writes = {
    'business/chats/fact/a_message_has_been_written': ({ message }) => filing(message.bond, message.id, (place) => ({
        whose: 'mine',
        place,
        message,
        progress: { stage: 'on_its_way' },
    })),
    'business/chats/fact/a_message_has_been_delivered': closing('the_message_was_received'),
    'business/chats/fact/a_message_has_had_no_receipt': closing('the_message_had_no_receipt'),
    'business/chats/fact/a_message_could_not_be_delivered': closing('the_peer_cannot_receive_it'),
    'business/chats/fact/a_message_has_been_called_off': closing('the_message_was_called_off'),
    'business/chats/fact/a_message_has_been_received': ({ message }) => filing(message.bond, message.id, (place) => ({ whose: 'theirs', place, message })),
    'business/chats/fact/a_chat_has_been_read': (fact) => ({
        reads: [the_folder(fact.bond), the_message(fact.bond, fact.up_to)],
        writes: (seen) => {
            const folder = folder_in(seen, fact.bond);
            const up_to = message_in(seen, fact.bond, fact.up_to);
            return folder === undefined || up_to === undefined
                ? []
                : [
                    {
                        write: 'set',
                        key: the_folder(fact.bond),
                        value: zz.as_json(read_up_to(up_to, fact.at)(folder)),
                    },
                ];
        },
    }),
    'business/chats/fact/a_chat_has_been_read_again': nothing,
};
/** What the executor holds of each message's delivery, on the records read (MSG-13): its dead letter, or its letter discarded. */
const what_the_executor_holds = (records) => {
    const held = new Set(records(the_executor_s.held(the_effect))
        .map((entry) => the_entry_of_a_held(entry.value))
        .filter((entry) => entry.dead)
        .map((entry) => entry.id));
    const discarded = new Set(records(the_executor_s.discarded(the_effect)).map((entry) => decodeURIComponent(entry.key.slice(the_executor_s.discarded(the_effect).length))));
    return (message_id) => held.has(message_id)
        ? 'its_dead_letter'
        : discarded.has(message_id)
            ? 'its_letter_discarded'
            : 'nothing';
};
/** The records of the chats read, by chat: each folder with its messages. */
const the_folders = (records, within) => within.flatMap((prefix) => {
    const entries = records(prefix);
    const folders = new Map();
    for (const entry of entries) {
        const chat = entry.key.slice(0, entry.key.indexOf('/', every_chat.length) + 1);
        const kept = folders.get(chat) ?? { messages: [] };
        if (entry.key === `${chat}folder`)
            kept.folder = a_chat_s_folder.parse(entry.value);
        else
            kept.messages.push(a_message_in_a_chat.parse(entry.value));
        folders.set(chat, kept);
    }
    return [...folders.values()].flatMap(({ folder, messages }) => folder === undefined ? [] : [{ folder, messages }]);
});
/** The messages of the chats, each as a chat tells it, her stage with what the executor holds. */
const the_messages = {
    under: [every_chat],
    besides: [the_executor_s.held(the_effect), the_executor_s.discarded(the_effect)],
    candidates: (records, within) => {
        const held = what_the_executor_holds(records);
        return the_folders(records, within).flatMap(({ messages }) => messages.map(as_a_message_of_a_chat(held)));
    },
};
/** The chats at a glance: one per folder with a message, its last and how many to read. */
const the_chats = {
    under: [every_chat],
    besides: [the_executor_s.held(the_effect), the_executor_s.discarded(the_effect)],
    candidates: (records, within) => {
        const held = what_the_executor_holds(records);
        return the_folders(records, within).flatMap(({ folder, messages }) => {
            const last = the_last_of(messages);
            return last === undefined
                ? []
                : [
                    {
                        bond: folder.bond,
                        the_last_message: as_a_message_of_a_chat(held)(last),
                        to_read: to_read(folder, messages),
                    },
                ];
        });
    },
};
export const message_selection = {
    ...selection_operators(),
    predicate: {
        'business/chats/selection/message/the_message_is_of_this_chat': (p) => ({
            within: [the_chat_of(p.bond)],
            keeps: () => (message) => message.bond === p.bond,
        }),
    },
};
export const chat_selection = {
    ...selection_operators(),
    predicate: {
        'business/chats/selection/chat/the_chat_is_of_this_bond': (p) => ({
            within: [the_chat_of(p.bond)],
            keeps: () => (chat) => chat.bond === p.bond,
        }),
    },
};
/** A field read as it is from a candidate. */
const as_it_is = (name) => (candidate) => candidate[name];
export const message_sources = {
    a_chat: {
        from: the_messages,
        fields: {
            message_id: as_it_is('message_id'),
            bond: as_it_is('bond'),
            place: as_it_is('place'),
            text: as_it_is('text'),
            at: as_it_is('at'),
            whose: as_it_is('whose'),
        },
    },
};
export const chat_sources = {
    a_chat_at_a_glance: {
        from: the_chats,
        fields: {
            bond: as_it_is('bond'),
            the_last_message: as_it_is('the_last_message'),
            to_read: as_it_is('to_read'),
        },
    },
};

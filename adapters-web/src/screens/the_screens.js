import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
// The screens of the phone, rendered (UI-1, V2, ADP-7): the way she opened
// them, each kept while it is open (only the last shown); the start read
// from her node (her faces, the face she acts as, a link she opened), and,
// when those reads fail, the fault told, never an endless wait (a record out
// of its form told as the data of an older test release, WEB-8, with the
// gesture to clear them where the composition root gives it); what a turn
// asks handed to her node in the order asked, and where it goes on the way;
// her node's changes counted, so that each screen reads it again.
import { signal } from '@preact/signals';
import * as ui from '@q-mino/domains/ui/_dsl.ts';
import { useEffect } from 'preact/hooks';
import { ARecordOutOfItsForm } from "../indexeddb/index.js";
import { kept } from "./a_screen.js";
import { AContact } from "./a_contact.js";
import { APage } from "./a_page.js";
import { AnExtension } from "./an_extension.js";
import { AnInvitation } from "./an_invitation.js";
import { MyContacts } from "./my_contacts.js";
import { TheAppContext, TheScreenIsShown } from "./the_app.js";
import { TheExtensions } from "./the_extensions.js";
import { TheFirstFace } from "./the_first_face.js";
import { TheHandshakeAtADistance } from "./the_handshake_at_a_distance.js";
import { TheHandshakeInPerson } from "./the_handshake_in_person.js";
import { TheServer } from "./the_server.js";
import { WhatHappened } from "./what_happened.js";
const why_they_do_not_open = (fault) => fault instanceof ARecordOutOfItsForm
    ? { why: 'the_data_of_an_older_test_release', message: fault.message }
    : { why: 'a_fault', message: fault instanceof Error ? fault.message : String(fault) };
/** A key for each screen of the way, by its object: a screen stays while its object does (the way after keeps the screens it does not change). */
const a_key_for = () => {
    const keys = new WeakMap();
    let next = 0;
    return (screen) => {
        const known = keys.get(screen);
        if (known !== undefined)
            return known;
        next += 1;
        keys.set(screen, next);
        return next;
    };
};
export const TheScreens = (props) => {
    const root = kept(() => {
        const way = signal(undefined);
        const changes = signal(0);
        const went_wrong = signal(false);
        const the_link = signal(undefined);
        const does_not_open = signal(undefined);
        const the_strip = signal(undefined);
        const changed = () => {
            changes.value = changes.peek() + 1;
        };
        // What a turn asks, handed in the order asked: a draft kept as she types
        // is kept in the order of her keys.
        let handed = Promise.resolve();
        const asks = (what) => {
            handed = handed
                .then(() => props.node.asks(what))
                .then(changed, () => {
                went_wrong.value = true;
            });
        };
        const starts = async () => {
            const read = await Promise.all([props.node.her_faces(), props.node.the_active_face()]).then((both) => ({ read: 'done', both }), (fault) => ({ read: 'failed', why: why_they_do_not_open(fault) }));
            if (read.read === 'failed') {
                does_not_open.value = read.why;
                return;
            }
            const [faces, the_active_face] = read.both;
            const start = ui.the_start({ faces, the_active_face, a_link: the_link.peek() });
            // A link waits for her first face; once she has one, the start opens it, once.
            if (faces.length > 0)
                the_link.value = undefined;
            for (const one of start.asks)
                asks(one);
            way.value = start.way;
        };
        const goes = (where) => {
            if (where.goes === 'to_the_start') {
                void starts();
                return;
            }
            const now = way.peek();
            if (now !== undefined)
                way.value = ui.the_way_after(now, where, now);
        };
        const app = {
            get node() {
                return props.node;
            },
            get device() {
                return props.device;
            },
            get common() {
                return props.texts.common;
            },
            changes,
            asks,
            goes,
            words: (extension) => props.texts.extensions[extension],
        };
        return {
            way,
            changes,
            went_wrong,
            the_link,
            does_not_open,
            the_strip,
            changed,
            starts,
            app,
            key_of: a_key_for(),
        };
    });
    // The strip over every screen (UI-5), read again at each change of her
    // node: no network, else the relay that did not answer; only the last
    // read started is kept.
    useEffect(() => {
        let latest = 0;
        return root.changes.subscribe(() => {
            latest += 1;
            const this_read = latest;
            void (async () => ui.the_strip({
                relay: (await props.node.the_relay()).met,
                network: await props.node.the_network(),
            }))().then((strip) => {
                if (this_read === latest)
                    root.the_strip.value = strip;
            });
        });
    }, []);
    useEffect(() => {
        root.the_link.value = props.a_link;
        const stops = props.node.when_it_changes(root.changed);
        void root.starts();
        return stops;
    }, []);
    const the_screen = (screen) => {
        switch (screen.screen) {
            case 'the_first_face':
                return _jsx(TheFirstFace, { texts: props.texts.the_first_face });
            case 'my_contacts':
                return _jsx(MyContacts, { texts: props.texts.my_contacts });
            case 'a_contact':
                return _jsx(AContact, { texts: props.texts.a_contact, screen: screen });
            case 'the_handshake_in_person':
                return _jsx(TheHandshakeInPerson, { texts: props.texts.the_handshake_in_person });
            case 'the_handshake_at_a_distance':
                return _jsx(TheHandshakeAtADistance, { texts: props.texts.the_handshake_at_a_distance });
            case 'an_invitation':
                return _jsx(AnInvitation, { texts: props.texts.an_invitation, screen: screen });
            case 'the_extensions':
                return _jsx(TheExtensions, { texts: props.texts.the_extensions });
            case 'an_extension':
                return _jsx(AnExtension, { texts: props.texts.an_extension, screen: screen });
            case 'a_page':
                return _jsx(APage, { texts: props.texts.a_page, screen: screen });
            case 'what_happened':
                return _jsx(WhatHappened, { texts: props.texts.what_happened });
            case 'the_server':
                return _jsx(TheServer, { texts: props.texts.the_server });
        }
    };
    const strip = root.the_strip.value?.strip;
    const why = root.does_not_open.value;
    const the_way = root.way.value;
    return (_jsx(TheAppContext.Provider, { value: root.app, children: _jsxs("main", { children: [strip === 'no_network' && (_jsx("p", { role: "status", "data-state": strip, children: props.texts.common.no_network })), strip === 'the_relay_does_not_answer' && (_jsx("p", { role: "status", "data-state": strip, children: props.texts.common.the_relay_does_not_answer })), why !== undefined ? (_jsxs("section", { role: "alert", "data-state": why.why, children: [_jsx("h1", { children: props.texts.common.it_does_not_start }), why.why === 'the_data_of_an_older_test_release' && (_jsxs(_Fragment, { children: [_jsx("p", { children: props.texts.common.the_data_of_an_older_test_release }), props.clears_the_data_and_starts_again !== undefined && (_jsx("button", { type: "button", onClick: () => {
                                        props.clears_the_data_and_starts_again?.();
                                    }, children: props.texts.common.clear_the_data_and_start_again }))] })), _jsx("h2", { children: props.texts.common.why }), _jsx("pre", { children: why.message })] })) : the_way === undefined ? (_jsx("p", { role: "status", children: props.texts.common.opening })) : (the_way.map((screen, index) => (_jsx(AScreenOfTheWay, { shown: index === the_way.length - 1, children: the_screen(screen) }, root.key_of(screen))))), root.went_wrong.value && _jsx("p", { role: "alert", children: props.texts.common.something_went_wrong })] }) }));
};
/** A screen of the way, kept while it is open, hidden unless it is the one shown, told whether it is. */
const AScreenOfTheWay = (props) => {
    const shown = kept(() => signal(props.shown));
    useEffect(() => {
        shown.value = props.shown;
    }, [props.shown]);
    return (_jsx(TheScreenIsShown.Provider, { value: shown, children: _jsx("div", { hidden: !props.shown, children: props.children }) }));
};

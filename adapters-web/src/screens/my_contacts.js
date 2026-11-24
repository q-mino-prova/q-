import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
// Her contacts, the home of stage 1 (UI-5): her bonds by the names she gives
// them, as introduced when it differs, whether they have her; none yet, the
// two handshakes; the menu; a word when something happened.
import * as my_contacts from '@q-mino/domains/ui/my_contacts/_dsl.ts';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { the_app } from "./the_app.js";
export const MyContacts = (props) => {
    const app = the_app();
    const screen = a_screen(app, {
        at_the_start: my_contacts.at_the_start,
        after: my_contacts.after,
    });
    const given = what_it_is_given(app, screen.state, async () => {
        const [contacts, held_letters, happened] = await Promise.all([
            app.node.her_contacts(),
            app.node.the_held_letters(),
            app.node.what_happened(),
        ]);
        return {
            contacts: [...contacts],
            held_letters: held_letters.length,
            happened: happened.length,
        };
    });
    const state = screen.state.value;
    const read = given.value;
    const it = state === undefined || read === undefined
        ? undefined
        : my_contacts.what_it_shows(state, read.given);
    const chooses = (entry) => {
        screen.happens({ happens: 'she_chooses', entry });
    };
    return (_jsxs("section", { "aria-label": props.texts.title, "data-state": it?.contacts.are, children: [_jsx("h1", { children: props.texts.title }), it !== undefined && (_jsxs(_Fragment, { children: [it.menu === undefined ? (_jsx("button", { type: "button", onClick: () => {
                            screen.happens({ happens: 'she_opens_the_menu' });
                        }, children: props.texts.the_menu })) : (_jsxs("nav", { "aria-label": props.texts.the_menu, children: [it.menu.map((entry) => (_jsx("button", { type: "button", onClick: () => {
                                    chooses(entry);
                                }, children: props.texts.the_entries[entry] }, entry))), _jsx("button", { type: "button", onClick: () => {
                                    screen.happens({ happens: 'she_closes_the_menu' });
                                }, children: props.texts.close_the_menu })] })), it.something_happened !== undefined && (_jsx("button", { type: "button", onClick: () => {
                            screen.happens({ happens: 'she_opens_what_happened' });
                        }, children: props.texts.something_happened(it.something_happened.held_letters, it.something_happened.happened) })), it.contacts.are === 'none_yet' && (_jsxs(_Fragment, { children: [_jsx("p", { children: props.texts.none_yet }), it.contacts.ways.map((entry) => (_jsx("button", { type: "button", onClick: () => {
                                    chooses(entry);
                                }, children: props.texts.the_entries[entry] }, entry)))] })), it.contacts.are === 'some' && (_jsx("ul", { children: it.contacts.list.map((contact) => (_jsxs("li", { children: [_jsx("button", { type: "button", onClick: () => {
                                        screen.happens({ happens: 'she_opens_a_contact', bond: contact.bond });
                                    }, children: contact.name }), contact.introduced_as !== undefined && (_jsxs("small", { children: [" ", props.texts.introduced_as(contact.introduced_as)] })), _jsxs("small", { children: [' ', contact.they_have_me ? props.texts.they_have_you : props.texts.not_yet] })] }, contact.bond))) }))] }))] }));
};

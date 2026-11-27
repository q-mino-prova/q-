import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
// Her contacts, the home of stage 1 (UI-5): her bonds by the names she gives
// them, as introduced when it differs, whether they have her; on each row,
// the marks of the extensions offered to it, each with its slots there,
// compact (MSG-15, K-13; part M4 of messaging); none yet, the two
// handshakes; the menu, a popover over the screen (WEB-29); a word when
// something happened.
import * as my_contacts from '@q-mino/domains/ui/my_contacts/_dsl.ts';
import { Gesture, List, Menu, Row, Screen } from "../design/index.js";
import { a_screen, what_it_is_given } from "./a_screen.js";
import { TheMark, ThePoints } from "./parts.js";
import { the_app } from "./the_app.js";
/** The glyph of each entry of the menu. */
const the_glyph_of = {
    the_handshake_in_person: 'qr_code',
    the_handshake_at_a_distance: 'link',
    the_extensions: 'puzzle',
    what_happened: 'history',
    the_introduction: 'book_open',
    the_server: 'info',
};
export const MyContacts = (props) => {
    const app = the_app();
    const screen = a_screen(app, {
        at_the_start: my_contacts.at_the_start,
        after: my_contacts.after,
    });
    const given = what_it_is_given(app, screen.state, async () => {
        const [contacts, held_letters, happened, extensions, offers] = await Promise.all([
            app.node.her_contacts(),
            app.node.the_held_letters(),
            app.node.what_happened(),
            app.node.the_extensions(),
            app.node.the_offers(),
        ]);
        return {
            contacts: [...contacts],
            held_letters: held_letters.length,
            happened: happened.length,
            extensions: [...extensions],
            offers,
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
    const taps = (does) => ({ does: 'taps', taps: does });
    return (_jsxs(Screen, { title: props.texts.title, state: it?.contacts.are, back: it !== undefined && (_jsx("span", { "data-part": "the-menu", children: _jsx(Gesture, { kind: "quiet", label: props.texts.the_menu, glyph: "ellipsis_vertical", does: taps(() => {
                    screen.happens({ happens: 'she_opens_the_menu' });
                }) }) })), children: [it?.menu !== undefined && (_jsxs(Menu, { label: props.texts.the_menu, closes: () => {
                    screen.happens({ happens: 'she_closes_the_menu' });
                }, children: [it.menu.map((entry) => (_jsx(Gesture, { kind: "quiet", label: props.texts.the_entries[entry], glyph: the_glyph_of[entry], does: taps(() => {
                            chooses(entry);
                        }) }, entry))), _jsx(Gesture, { kind: "quiet", label: props.texts.close_the_menu, glyph: "x", does: taps(() => {
                            screen.happens({ happens: 'she_closes_the_menu' });
                        }) })] })), it?.something_happened !== undefined && (_jsx(Gesture, { kind: "secondary", glyph: "history", label: props.texts.something_happened(it.something_happened.held_letters, it.something_happened.happened), does: taps(() => {
                    screen.happens({ happens: 'she_opens_what_happened' });
                }) })), it?.contacts.are === 'none_yet' && (_jsxs(_Fragment, { children: [_jsx("p", { children: props.texts.none_yet }), _jsx("div", { "data-part": "gestures", children: it.contacts.ways.map((entry, at) => (_jsx(Gesture, { kind: at === 0 ? 'primary' : 'secondary', label: props.texts.the_entries[entry], glyph: the_glyph_of[entry], does: taps(() => {
                                chooses(entry);
                            }) }, entry))) })] })), it?.contacts.are === 'some' && (_jsx(List, { label: props.texts.title, children: it.contacts.list.map((contact) => (_jsx(Row, { glyph: "user", title: contact.name, detail: _jsxs(_Fragment, { children: [contact.introduced_as !== undefined && (_jsxs("span", { children: [props.texts.introduced_as(contact.introduced_as), " "] })), _jsx("span", { children: contact.they_have_me ? props.texts.they_have_you : props.texts.not_yet })] }), opens: () => {
                        screen.happens({ happens: 'she_opens_a_contact', bond: contact.bond });
                    }, ...(contact.marks.length === 0
                        ? {}
                        : {
                            below: contact.marks.map((mark) => (_jsx(TheMark, { extension: mark.extension, children: _jsx(ThePoints, { mark: mark, course_of: () => ({ course: 'nothing_asked' }), taps: () => undefined, opens: () => undefined }) }, mark.extension))),
                        }) }, contact.bond))) }))] }));
};

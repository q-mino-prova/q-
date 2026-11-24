import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
// The handshake in person, the crossed QR (UI-5, WEB-1, WEB-2): opened, the
// screen prepares a ticket of hers; ready, it shows the QR of its link and
// plays the camera in its video, each text it reads told as a scan: the
// front camera by default (the two face each other, screen to screen),
// turned to the rear and back by her gesture where the device has more than
// one; the camera is on only while she scans, off once she does not and
// when the screen closes. Once she scanned theirs, her QR stays shown, the
// camera off, until her gesture puts it away (the other phone may still be
// reading it); then bonded, she opens the contact or shakes another hand. Since the MVP's part 2
// drawn with the design's components (WEB-29).
import { computed, signal, untracked } from '@preact/signals';
import * as ui_value from '@q-mino/domains/ui/_value.ts';
import * as the_handshake_in_person from '@q-mino/domains/ui/the_handshake_in_person/_dsl.ts';
import { useEffect, useRef } from 'preact/hooks';
import { the_qr_of } from "../qr/index.js";
import { the_ticket_in_a_link } from "../ticket_link/index.js";
import { Gesture, Notice, Qr, Screen, Viewfinder } from "../design/index.js";
import { a_screen, kept, what_it_is_given, while_it_is_open } from "./a_screen.js";
import { Back, the_kind_of_an_end } from "./parts.js";
import { the_app, the_words_of_an_end, what_it_asked_now } from "./the_app.js";
/** What a text the camera read holds, as the link of a ticket carries it (WEB-1), the ticket in her words or out of its form. */
const what_it_holds = (text) => {
    const read = the_ticket_in_a_link(text);
    switch (read.carries) {
        case 'a_ticket': {
            const parsed = ui_value.what_it_holds.safeParse({ holds: 'a_ticket', ticket: read.ticket });
            return parsed.success ? parsed.data : { holds: 'a_ticket_out_of_its_form' };
        }
        case 'no_ticket':
            return { holds: 'no_ticket' };
        case 'a_ticket_out_of_its_form':
            return { holds: 'a_ticket_out_of_its_form' };
    }
};
/** The QR of her ticket's link, or the link alone when it is longer than a QR holds; drawn again only when the link changes. */
const TheQr = (props) => {
    const drawn = useRef(undefined);
    if (drawn.current?.link !== props.link)
        drawn.current = { link: props.link, qr: the_qr_of(props.link) };
    const qr = drawn.current.qr;
    return qr.drawn === 'a_qr' ? (_jsx(Qr, { label: props.texts.the_qr, svg: qr.svg })) : (_jsxs(_Fragment, { children: [_jsx("p", { children: props.texts.too_long_for_a_qr }), _jsx("p", { children: props.link })] }));
};
/** How the camera, when it is not on, is told (WEB-29): getting ready is a wait; refused, missing or busy are faults of the place. */
const the_kind_of_the_camera = (camera) => camera === 'off' ? 'waiting' : 'fault';
/** How what she scanned that opens nothing is told: no ticket is information, one out of its form a fault. */
const the_kind_of_a_scan = (scanned) => scanned === 'no_ticket' ? 'information' : 'fault';
/** Where the camera faces, by its side, in the browser's words (WEB-2): the front faces her. */
const the_facing_of = {
    front: 'user',
    rear: 'environment',
};
/** Her QR, the camera's words and the gesture that turns it while she scans (her ticket ready, or theirs not opened). */
const WhileSheScans = (props) => {
    return (_jsxs(_Fragment, { children: [_jsx("p", { children: props.texts.show_and_scan }), props.link !== undefined && _jsx(TheQr, { link: props.link, texts: props.texts }), props.camera !== 'on' && (_jsx("div", { "data-part": "the-camera", "data-state": props.camera, children: _jsx(Notice, { kind: the_kind_of_the_camera(props.camera), children: props.texts.the_camera[props.camera] }) })), props.turn !== 'none' && (_jsx("div", { "data-part": "the-turn", "data-state": props.turn, children: _jsx(Gesture, { kind: "quiet", glyph: "refresh_cw", label: props.texts.turn_the_camera[props.turn], does: {
                        does: 'taps',
                        taps: () => {
                            props.onTurn();
                        },
                    } }) }))] }));
};
/**
 * The words of a bond made on the screen (BND-10; Alessandro, 21 Nov 2026):
 * "in person" only when her node said it met them in person; an opening
 * done on a bond at a distance, as her node measured it, does not say it.
 */
export const the_words_of_a_bond_made = (texts, made) => made.already
    ? texts.bonded_already(made.introduced_as)
    : made.said.event === 'you_met_in_person'
        ? texts.bonded_in_person(made.introduced_as)
        : texts.bonded(made.introduced_as);
export const TheHandshakeInPerson = (props) => {
    const app = the_app();
    const screen = a_screen(app, {
        at_the_start: the_handshake_in_person.at_the_start,
        after: the_handshake_in_person.after,
        told_the_end: (ended) => ended,
    });
    const given = what_it_is_given(app, screen.state, async (state) => {
        const asked = [
            state.ticket?.prepared.asked,
            state.scanned?.scanned === 'their_ticket' ? state.scanned.opened.asked : undefined,
        ].flatMap((one) => (one === undefined ? [] : [one]));
        const [her_ticket, cards] = await Promise.all([
            state.ticket === undefined ? undefined : app.node.her_ticket(state.ticket.bond),
            Promise.all(asked.map((one) => app.node.an_activity(one.activity_id))),
        ]);
        const activities = cards.flatMap((card) => card === undefined ? [] : [card]);
        const model = her_ticket === undefined ? { activities } : { ticket: her_ticket.ready, activities };
        return { model, link: her_ticket?.link };
    });
    const shown = kept(() => computed(() => {
        const state = screen.state.value;
        const read = given.value;
        return state === undefined || read === undefined
            ? undefined
            : the_handshake_in_person.what_it_shows(state, read.given.model);
    }));
    const a_new_ticket = (happens) => {
        void app.node.the_active_face().then((face) => {
            if (face === undefined)
                return;
            screen.happens({
                happens,
                asked: what_it_asked_now(app.device),
                bond: app.device.draws_an_id(),
                face,
            });
        });
    };
    // Opened: once its state is there, the screen is opened, once.
    const started = kept(() => computed(() => screen.state.value !== undefined));
    useEffect(() => started.subscribe((it) => {
        if (it)
            a_new_ticket('the_screen_is_opened');
    }), []);
    // The camera, on while she scans, facing her side's way; each text it reads
    // told as a scan, with an activity drawn, and the device's cameras counted
    // once it is on; off once she no longer scans, when she turns it (the
    // device's camera turns the one before off before it opens the next, WEB-2)
    // and when the screen closes.
    const the_video = useRef(null);
    const video = kept(() => signal(undefined));
    useEffect(() => {
        video.value = the_video.current ?? undefined;
    }, []);
    const facing = kept(() => computed(() => {
        const it = shown.value;
        const side = it?.shows === 'ready' || it?.shows === 'their_ticket_cannot_be_opened' ? it.side : undefined;
        return side === undefined ? undefined : the_facing_of[side];
    }));
    const turns_the_camera = () => {
        screen.happens({ happens: 'she_turns_the_camera' });
    };
    while_it_is_open(() => {
        const element = video.value;
        const facing_now = facing.value;
        if (element === undefined || facing_now === undefined)
            return;
        return untracked(() => {
            const a_scan = app.device.scans(element, facing_now);
            // This scan's run over (she no longer scans, or the screen closed): what it reads then is told no more.
            let over = false;
            const is_over = () => over;
            void a_scan.then(async (scan) => {
                if (is_over())
                    return;
                screen.happens({ happens: 'the_camera_is', camera: scan.is });
                if (scan.is !== 'on')
                    return;
                screen.happens({ happens: 'the_cameras_are_counted', cameras: scan.cameras });
                for await (const text of scan.texts) {
                    if (is_over())
                        return;
                    screen.happens({
                        happens: 'she_scans',
                        holds: what_it_holds(text),
                        asked: what_it_asked_now(app.device),
                    });
                }
            });
            return () => {
                over = true;
                void a_scan.then((scan) => {
                    if (scan.is === 'on')
                        scan.turn_off();
                });
            };
        });
    });
    const it = shown.value;
    const link = given.value?.given.link;
    const scanning = it?.shows === 'ready' || it?.shows === 'their_ticket_cannot_be_opened';
    const taps = (does) => ({ does: 'taps', taps: does });
    return (_jsxs(Screen, { title: props.texts.title, state: it?.shows, back: _jsx(Back, { onBack: () => {
                screen.happens({ happens: 'she_goes_back' });
            } }), children: [it?.shows === 'getting_the_ticket_ready' && (_jsx(Notice, { kind: "waiting", children: props.texts.getting_the_ticket_ready })), it?.shows === 'the_ticket_cannot_be_prepared' && (_jsxs(_Fragment, { children: [_jsx(Notice, { kind: "fault", children: props.texts.the_ticket_cannot_be_prepared }), _jsx(Notice, { kind: the_kind_of_an_end(it.how), children: the_words_of_an_end(app.common, it.how) }), _jsx("div", { "data-part": "gestures", children: _jsx(Gesture, { kind: "primary", label: props.texts.try_again, does: taps(() => {
                                a_new_ticket('she_shakes_another_hand');
                            }) }) })] })), it?.shows === 'ready' && (_jsxs(_Fragment, { children: [_jsx(WhileSheScans, { link: link, camera: it.camera, turn: it.turn, onTurn: turns_the_camera, texts: props.texts }), it.scanned !== 'nothing' && (_jsx("div", { "data-part": "scanned", "data-state": it.scanned, children: _jsx(Notice, { kind: the_kind_of_a_scan(it.scanned), children: props.texts.scanned[it.scanned] }) }))] })), it?.shows === 'their_ticket_read' && (_jsxs(_Fragment, { children: [_jsx(Notice, { kind: "done", children: props.texts.their_ticket_read }), link !== undefined && _jsx(TheQr, { link: link, texts: props.texts }), _jsx("div", { "data-part": "gestures", children: _jsx(Gesture, { kind: "primary", label: props.texts.done, does: taps(() => {
                                screen.happens({ happens: 'she_puts_her_qr_away' });
                            }) }) })] })), it?.shows === 'opening_their_ticket' && (_jsx(Notice, { kind: "waiting", children: props.texts.opening_their_ticket(it.introduced_as) })), it?.shows === 'bonded' && (_jsxs(_Fragment, { children: [_jsx(Notice, { kind: "done", children: the_words_of_a_bond_made(props.texts, it) }), _jsxs("div", { "data-part": "gestures", children: [_jsx(Gesture, { kind: "primary", label: props.texts.open_the_contact, does: taps(() => {
                                    screen.happens({ happens: 'she_opens_the_contact' });
                                }) }), _jsx(Gesture, { kind: "secondary", label: props.texts.shake_another_hand, does: taps(() => {
                                    a_new_ticket('she_shakes_another_hand');
                                }) })] })] })), it?.shows === 'their_ticket_cannot_be_opened' && (_jsxs(_Fragment, { children: [_jsx(Notice, { kind: "fault", children: props.texts.their_ticket_cannot_be_opened(it.introduced_as) }), _jsx(Notice, { kind: the_kind_of_an_end(it.how), children: the_words_of_an_end(app.common, it.how) }), _jsx("p", { children: props.texts.scan_again }), _jsx(WhileSheScans, { link: link, camera: it.camera, turn: it.turn, onTurn: turns_the_camera, texts: props.texts })] })), _jsx(Viewfinder, { hidden: !scanning, children: _jsx("video", { ref: the_video, muted: true, playsInline: true, hidden: !scanning }) })] }));
};

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
// An invitation, a link of a ticket she opened (UI-5, WEB-1): who wants to
// shake her hand, at a distance; the name she gives them, theirs by default;
// she accepts or declines. Accepted, her ticket is prepared and, once it is
// ready, the screen is told so once, and theirs is opened on it; offline,
// it waits, and says so. A link out of its form is told, and opens nothing. Since the MVP's part 2 drawn
// with the design's components (WEB-29).
import { computed } from '@preact/signals';
import * as an_invitation from '@q-mino/domains/ui/an_invitation/_dsl.ts';
import { useEffect } from 'preact/hooks';
import { Field, Gesture, Notice, Screen } from "../design/index.js";
import { a_screen, kept, what_it_is_given } from "./a_screen.js";
import { Back, the_kind_of_an_end } from "./parts.js";
import { the_app, the_words_of_an_end, what_it_asked_now } from "./the_app.js";
export const AnInvitation = (props) => {
    const app = the_app();
    const opened_on = kept(() => props.screen);
    const screen = a_screen(app, {
        at_the_start: () => an_invitation.at_the_start(opened_on.link),
        after: an_invitation.after,
        told_the_end: (ended) => ended,
    });
    const given = what_it_is_given(app, screen.state, async (state) => {
        const step = state.step;
        if (step.step !== 'accepted')
            return { model: { activities: [] }, ready: undefined };
        const asked = [step.prepared.asked, step.opened?.asked].flatMap((one) => one === undefined ? [] : [one]);
        const [her_ticket, cards] = await Promise.all([
            app.node.her_ticket(step.bond),
            Promise.all(asked.map((one) => app.node.an_activity(one.activity_id))),
        ]);
        const activities = cards.flatMap((card) => card === undefined ? [] : [card]);
        const model = { activities };
        return { model, ready: her_ticket?.ready };
    });
    // Her ticket ready for the bond she accepted on, before theirs is opened:
    // the screen is told once (its model opens theirs on it).
    const her_ticket_ready = kept(() => computed(() => {
        const step = screen.state.value?.step;
        const ready = given.value?.given.ready;
        return step?.step === 'accepted' && step.opened === undefined && ready?.bond === step.bond
            ? ready.bond
            : undefined;
    }));
    useEffect(() => her_ticket_ready.subscribe((bond) => {
        if (bond !== undefined)
            screen.happens({ happens: 'her_ticket_is_ready', bond });
    }), []);
    /** She accepts, by her active face (stage 1 has one): the bond's id and the two activities' drawn at the tap. */
    const accepts = () => {
        void app.node.the_active_face().then((face) => {
            if (face === undefined)
                return;
            screen.happens({
                happens: 'she_accepts',
                bond: app.device.draws_an_id(),
                face,
                to_prepare: what_it_asked_now(app.device),
                to_open: what_it_asked_now(app.device),
            });
        });
    };
    const state = screen.state.value;
    const read = given.value;
    const shown = state === undefined || read === undefined
        ? undefined
        : an_invitation.what_it_shows(state, read.given.model);
    const taps = (does) => ({ does: 'taps', taps: does });
    return (_jsxs(Screen, { title: props.texts.title, state: shown?.shows, back: _jsx(Back, { onBack: () => {
                screen.happens({ happens: 'she_goes_back' });
            } }), children: [shown?.shows === 'not_an_invitation' && (_jsx(Notice, { kind: "information", children: props.texts.not_an_invitation })), shown?.shows === 'the_invitation' && (_jsxs("form", { onSubmit: (event) => {
                    event.preventDefault();
                    accepts();
                }, children: [_jsx("p", { children: props.texts.wants_to_shake_your_hand(shown.introduced_as) }), _jsx("p", { children: props.texts.if_you_accept }), _jsx(Field, { label: props.texts.the_name_you_give, name: "name", holds: {
                            holds: 'the_screens',
                            value: shown.name,
                            types: (name) => {
                                screen.happens({ happens: 'she_types_the_name', name });
                            },
                        } }), _jsxs("div", { "data-part": "gestures", children: [_jsx(Gesture, { kind: "primary", label: props.texts.accept, off: shown.the_button !== 'on', does: { does: 'submits' } }), _jsx(Gesture, { kind: "secondary", label: props.texts.decline, does: taps(() => {
                                    screen.happens({ happens: 'she_declines' });
                                }) })] })] })), shown?.shows === 'on_its_way' && (_jsxs(_Fragment, { children: [_jsx(Notice, { kind: "waiting", children: props.texts.on_its_way(shown.introduced_as) }), _jsx("p", { children: props.texts.it_waits_offline })] })), shown?.shows === 'bonded' && (_jsx(Notice, { kind: "done", children: shown.already
                    ? props.texts.bonded_already(shown.introduced_as)
                    : props.texts.bonded(shown.introduced_as) })), shown?.shows === 'the_invitation_no_longer_holds' && (_jsxs(_Fragment, { children: [_jsx(Notice, { kind: "fault", children: props.texts.no_longer_holds(shown.introduced_as) }), _jsx(Notice, { kind: the_kind_of_an_end(shown.how), children: the_words_of_an_end(app.common, shown.how) })] }))] }));
};

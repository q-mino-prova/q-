import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
// The handshake at a distance, from who invites (UI-5, WEB-1): the flaw told
// first; she makes a link, a ticket of hers for a bond to be; ready, the link,
// shared with the phone's share, or copied where the phone has none (WEB-18);
// one that cannot be prepared told, with how; again, another link, for
// another bond.
import * as the_handshake_at_a_distance from '@q-mino/domains/ui/the_handshake_at_a_distance/_dsl.ts';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { Back } from "./parts.js";
import { the_app, the_words_of_an_end, what_it_asked_now } from "./the_app.js";
/** The gesture that makes a link, in the words of where it is. */
const MakeALink = (props) => (_jsx("button", { type: "button", onClick: () => {
        props.makes();
    }, children: props.words }));
export const TheHandshakeAtADistance = (props) => {
    const app = the_app();
    const screen = a_screen(app, {
        at_the_start: the_handshake_at_a_distance.at_the_start,
        after: the_handshake_at_a_distance.after,
        told_the_end: (ended) => ended,
    });
    const the_phone = app.device.the_navigator.share === undefined ? 'copies' : 'shares';
    const given = what_it_is_given(app, screen.state, async (state) => {
        if (state.ticket === undefined)
            return { model: { the_phone }, link: undefined };
        const [her_ticket, activity] = await Promise.all([
            app.node.her_ticket(state.ticket.bond),
            app.node.an_activity(state.ticket.asked.activity_id),
        ]);
        const model = {
            ...(her_ticket === undefined ? {} : { ticket: her_ticket.ready }),
            ...(activity === undefined ? {} : { activity }),
            the_phone,
        };
        return { model, link: her_ticket?.link };
    });
    const hands_on = (link) => {
        const navigator = app.device.the_navigator;
        if (navigator.share !== undefined) {
            // A share she cancels, or the browser refuses, leaves the link on the screen, to share again.
            void navigator.share({ url: link }).catch(() => undefined);
            return;
        }
        void navigator.clipboard.writeText(link).then(() => {
            screen.happens({ happens: 'the_link_is_copied' });
        }, () => undefined);
    };
    /** She makes a link, by her active face (stage 1 has one): its ids drawn at the tap. */
    const makes_a_link = () => {
        void app.node.the_active_face().then((face) => {
            if (face === undefined)
                return;
            screen.happens({
                happens: 'she_makes_a_link',
                asked: what_it_asked_now(app.device),
                bond: app.device.draws_an_id(),
                face,
            });
        });
    };
    const state = screen.state.value;
    const read = given.value;
    const shown = state === undefined || read === undefined
        ? undefined
        : the_handshake_at_a_distance.what_it_shows(state, read.given.model);
    const link = shown?.shows === 'the_link' ? read?.given.link : undefined;
    return (_jsxs("section", { "aria-label": props.texts.title, "data-state": shown?.shows, children: [_jsx(Back, { onBack: () => {
                    screen.happens({ happens: 'she_goes_back' });
                } }), _jsx("h1", { children: props.texts.title }), shown?.shows === 'the_flaw_told' && (_jsxs(_Fragment, { children: [_jsx("p", { children: props.texts.the_flaw }), _jsx(MakeALink, { words: props.texts.make_a_link, makes: makes_a_link })] })), shown?.shows === 'getting_the_link_ready' && (_jsx("p", { role: "status", children: props.texts.getting_the_link_ready })), shown?.shows === 'the_link_cannot_be_prepared' && (_jsxs(_Fragment, { children: [_jsx("p", { role: "status", children: props.texts.the_link_cannot_be_prepared }), _jsx("p", { children: the_words_of_an_end(app.common, shown.how) }), _jsx(MakeALink, { words: props.texts.try_again, makes: makes_a_link })] })), shown?.shows === 'the_link' && link !== undefined && (_jsxs(_Fragment, { children: [_jsxs("label", { children: [props.texts.your_link, ' ', _jsx("input", { name: "link", readOnly: true, value: link, onFocus: (event) => {
                                    event.currentTarget.select();
                                } })] }), shown.gesture === 'copied' ? (_jsx("p", { role: "status", "data-state": shown.gesture, children: props.texts.the_link_is_copied })) : (_jsx("button", { type: "button", "data-state": shown.gesture, onClick: () => {
                            hands_on(link);
                        }, children: shown.gesture === 'share' ? props.texts.share_the_link : props.texts.copy_the_link })), _jsx(MakeALink, { words: props.texts.make_another, makes: makes_a_link })] }))] }));
};

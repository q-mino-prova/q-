// The pure functions shared by the screens (UI-1..UI-4): where the app starts,
// where a gesture takes her, the course of what a screen asked, and the
// places an extension is drawn in, each in the kernel's mark (EXT-16).
/**
 * Where the app starts (UI-1): with no face, at the first face, a link
 * waiting for it (opened again once she has one); with a face and none
 * active, her contacts, the face chosen (stage 1 has one, USR-6); a link
 * holding a ticket opens its invitation on top, and so does one out of its
 * form, which the invitation tells her; a link with no ticket opens nothing.
 */
export const the_start = (given) => {
    const [first] = given.faces;
    if (first === undefined)
        return { way: [{ screen: 'the_first_face' }], asks: [] };
    const asks = given.the_active_face === undefined ? [{ asks: 'to_change_face', face: first.face }] : [];
    const home = { screen: 'my_contacts' };
    return given.a_link === undefined || given.a_link.holds === 'no_ticket'
        ? { way: [home], asks }
        : { way: [home, { screen: 'an_invitation', link: given.a_link }], asks };
};
/**
 * The way after a gesture (UI-1): a screen opens on top, unless it is the one
 * shown; back closes the one shown, never the last; the start is the way the
 * start gives, computed by the caller from what her node holds then.
 */
export const the_way_after = (way, goes, start) => {
    switch (goes.goes) {
        case 'nowhere':
            return way;
        case 'to_a_screen':
            return the_same_screen(way.at(-1), goes.screen) ? way : [...way, goes.screen].slice(-32);
        case 'back':
            return way.length > 1 ? way.slice(0, -1) : way;
        case 'to_the_start':
            return start;
    }
};
const the_same_screen = (shown, other) => shown !== undefined && JSON.stringify(shown) === JSON.stringify(other);
/**
 * The course of what a screen asked (UI-3): nothing; in progress until
 * `user` reads it ended (an activity not read yet is in progress: asked
 * already); ended, how in her words.
 */
export const the_course_of = (asked, activity) => {
    if (asked === undefined)
        return { course: 'nothing_asked' };
    if (activity?.activity_id === asked.activity_id && activity.stage.stage === 'ended')
        return { course: 'ended', activity_id: asked.activity_id, how: activity.stage.how_it_ended };
    return { course: 'in_progress', activity_id: asked.activity_id, since: asked.at };
};
/** A turn that stays on the screen, with what it asks (UI-2). */
export const it_stays = (state, asks = []) => ({
    state,
    asks: [...asks],
    goes: { goes: 'nowhere' },
});
/** A turn that goes somewhere, with what it asks (UI-2). */
export const it_goes = (state, goes, asks = []) => ({
    state,
    asks: [...asks],
    goes,
});
/** Whether a screen may ask again: nothing asked, or what it asked ended (a tap repeated meanwhile asks nothing, UI-3). */
export const it_may_ask = (course) => course.course !== 'in_progress';
/**
 * The marks a place holds (UI-4, EXT-16, EXT-7): for each extension active
 * (on a bond's screen, offered to that bond, since an offer goes both ways),
 * the points its manifest declares at that place, in the order it declares
 * them, in the kernel's mark of the extension. An extension with no point
 * there has no mark there. An action of an extension not active, or on a bond
 * whose offer is withdrawn, is not drawn.
 */
export const the_marks_at = (place, given) => given.extensions
    .filter((extension) => extension.is === 'active')
    .filter((extension) => place.place === 'a_bond'
    ? given.offered.some((offer) => offer.extension === extension.extension && offer.bonds.includes(place.bond))
    : place.extension === extension.extension)
    .map((extension) => the_mark_of(extension, place))
    .filter((mark) => mark.actions.length + mark.slots.length + mark.pages.length > 0);
/** The mark of an extension at a place: its points there, by kind (EXT-16). */
export const the_mark_of = (extension, place) => {
    const here = extension.manifest.extension_points.filter((point) => point.place === place.place);
    const named = (point) => here.filter((one) => one.point === point).map((one) => one.name);
    return {
        extension: extension.extension,
        told: place,
        actions: [...named('action')],
        slots: [...named('slot')],
        pages: [...named('page')],
    };
};
/**
 * An action of a mark tapped (EXT-16, USR-2): an activity of `user`, the
 * extension's action on the place's data, as a gesture of the kernel's own.
 * An action the mark does not draw asks nothing: the screen drew none.
 */
export const an_action_tapped = (mark, action, activity_id) => mark.actions.includes(action)
    ? [
        {
            asks: 'an_activity',
            activity_id,
            what: {
                activity: 'use_an_action',
                extension: mark.extension,
                action,
                on: mark.told.place === 'a_bond'
                    ? { place: 'a_bond', bond: mark.told.bond }
                    : { place: 'the_extension' },
            },
        },
    ]
    : [];
/** A page of a mark opened (EXT-16): its screen, told the place's data; a page the mark does not hold opens nothing. */
export const a_page_opened = (mark, page) => mark.pages.includes(page)
    ? {
        goes: 'to_a_screen',
        screen: { screen: 'a_page', extension: mark.extension, page, told: mark.told },
    }
    : { goes: 'nowhere' };
/** A held letter sent again (USR-8): an activity of `user`, by whose it is and its name. */
export const a_letter_sent_again = (held, activity_id) => ({
    asks: 'an_activity',
    activity_id,
    what: { activity: 'send_a_held_letter_again', whose: held.whose, letter: held.letter },
});
/** A held letter put aside, with her reason (USR-8): an activity of `user`. */
export const a_letter_put_aside = (held, because, activity_id) => ({
    asks: 'an_activity',
    activity_id,
    what: { activity: 'put_a_held_letter_aside', whose: held.whose, letter: held.letter, because },
});
/** Whether a held letter is an extension's, shown in its mark (EXT-16, USR-8). */
export const a_letter_of = (held, extension) => held.whose.of === 'an_extension' && held.whose.extension === extension;
/** Whether what happened without a fact names an extension, shown in its mark (EXT-16, USR-8). */
export const it_happened_to = (happened, extension) => 'extension' in happened && happened.extension === extension;
/**
 * The strip over every screen (UI-5): no network, when her phone tells it,
 * whatever the relay last did; else the relay that did not answer when her
 * node last met it, or that answered it is full (REL-3); else none.
 */
export const the_strip = (her_node) => her_node.network === 'offline'
    ? { strip: 'no_network' }
    : her_node.relay === 'did_not_answer'
        ? { strip: 'the_relay_does_not_answer' }
        : her_node.relay === 'is_full'
            ? { strip: 'the_relay_is_full' }
            : { strip: 'none' };

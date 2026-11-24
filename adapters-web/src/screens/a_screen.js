// A screen of the rendering (UI-1, UI-3): its state kept in a signal while it
// is open, what happens on it turned by its `after` (its state after, what
// it asks, where it goes), the activities it asked followed until they end,
// each end told to it once; and what it is given, read again from her node
// each time its state or her node changes.
import * as ui_value from '@q-mino/domains/ui/_value.ts';
import { createEffect, createResource, createSignal, on } from 'solid-js';
/** A screen kept while it is open (UI-1). */
export const a_screen = (app, model) => {
    const [state, set_state] = createSignal(undefined, { equals: false });
    const [followed, set_followed] = createSignal([]);
    void Promise.resolve(model.at_the_start()).then((started) => set_state(() => started));
    const happens = (what) => {
        const now = state();
        if (now === undefined)
            return;
        const turn = model.after(now, what);
        set_state(() => turn.state);
        const asked = turn.asks.flatMap((one) => (one.asks === 'an_activity' ? [one.activity_id] : []));
        if (asked.length > 0)
            set_followed((ids) => [...ids, ...asked]);
        for (const one of turn.asks)
            app.asks(one);
        app.goes(turn.goes);
    };
    // What it asked, followed: at each change of her node each activity still
    // followed is read, and one ended is told to the screen once.
    createEffect(on(app.changes, () => {
        const told = model.told_the_end;
        if (told === undefined)
            return;
        for (const activity_id of followed())
            void app.node.an_activity(activity_id).then((card) => {
                if (card?.stage.stage !== 'ended' || !followed().includes(activity_id))
                    return;
                set_followed((ids) => ids.filter((id) => id !== activity_id));
                happens(told(ui_value.what_it_asked_ended.parse({
                    happens: 'what_it_asked_ended',
                    activity_id: card.activity_id,
                    how: card.stage.how_it_ended,
                })));
            });
    }));
    return { state, happens };
};
/** What a screen is given, read from her node with its state, again at each change of either; none until first read. */
export const what_it_is_given = (app, state, read) => {
    const [given] = createResource(() => {
        const now = state();
        return now === undefined ? undefined : { now, change: app.changes() };
    }, async (source) => ({ given: await read(source.now) }));
    return () => given.latest;
};

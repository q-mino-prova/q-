// A screen of the rendering (UI-1, UI-3): its state kept in a signal while it
// is open, what happens on it turned by its `after` (its state after, what
// it asks, where it goes), the activities it asked followed until they end,
// each end told to it once; and what it is given, read again from her node
// each time its state or her node changes.
import { computed, effect, signal } from '@preact/signals';
import * as ui_value from '@q-mino/domains/ui/_value.ts';
import { useEffect, useRef } from 'preact/hooks';
/**
 * What a component keeps from its first render to its last: made once, at
 * the first (its signals, its handlers), the same at every render after.
 * [Q, C, 24 Nov 2026]
 */
export const kept = (make) => {
    const ref = useRef(undefined);
    ref.current ??= { it: make() };
    return ref.current.it;
};
/**
 * An effect of a component on signals, run after its first render and again
 * at each change of the signals it reads, disposed when it is removed; what
 * it returns is its cleanup, run before its next run and at its disposal
 * (`effect` in `useEffect`, its cleanup the effect's disposal).
 */
export const while_it_is_open = (run) => {
    useEffect(() => effect(run), []);
};
/** A screen kept while it is open (UI-1). */
export const a_screen = (app, model) => {
    const screen = kept(() => {
        const state = signal(undefined);
        const followed = signal([]);
        const happens = (what) => {
            const now = state.peek();
            if (now === undefined)
                return;
            const turn = model.after(now, what);
            state.value = turn.state;
            const asked = turn.asks.flatMap((one) => one.asks === 'an_activity' ? [one.activity_id] : []);
            if (asked.length > 0)
                followed.value = [...followed.peek(), ...asked];
            for (const one of turn.asks)
                app.asks(one);
            app.goes(turn.goes);
        };
        // Its start read at its first render, as soon as it is drawn: a gesture
        // before its state is there is lost, so not one frame later.
        void Promise.resolve(model.at_the_start()).then((started) => {
            state.value = started;
        });
        return { state, followed, happens };
    });
    // What it asked, followed: at each change of her node each activity still
    // followed is read, and one ended is told to the screen once.
    useEffect(() => app.changes.subscribe(() => {
        const told = model.told_the_end;
        if (told === undefined)
            return;
        for (const activity_id of screen.followed.peek())
            void app.node.an_activity(activity_id).then((card) => {
                if (card?.stage.stage !== 'ended' || !screen.followed.peek().includes(activity_id))
                    return;
                screen.followed.value = screen.followed.peek().filter((id) => id !== activity_id);
                screen.happens(told(ui_value.what_it_asked_ended.parse({
                    happens: 'what_it_asked_ended',
                    activity_id: card.activity_id,
                    how: card.stage.how_it_ended,
                })));
            });
    }), []);
    return { state: screen.state, happens: screen.happens };
};
/**
 * What a screen is given, read from her node with its state, again at each
 * change of either; none until first read. Only the last read started is
 * kept, as a resource keeps it.
 */
export const what_it_is_given = (app, state, read) => {
    const given = kept(() => signal(undefined));
    const latest = useRef(0);
    useEffect(() => computed(() => ({ now: state.value, change: app.changes.value })).subscribe(({ now }) => {
        if (now === undefined)
            return;
        latest.current += 1;
        const this_read = latest.current;
        void read(now).then((it) => {
            if (this_read === latest.current)
                given.value = { given: it };
        });
    }), []);
    return given;
};

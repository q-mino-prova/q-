import { Fragment as _Fragment, jsx as _jsx } from "preact/jsx-runtime";
// The app around the screens (PWA-2, WEB-8, WEB-10, WEB-11; WEB-29): its cases before
// the screens, those after a stop and the storage told, its foot (the about) in each,
// and the update proposed (`phone/test/screens/the_app.test.tsx`, `the_opening.test.tsx`).
import { useRef } from 'preact/hooks';
import { App } from "../../../App.js";
import { TheUpdateProposed } from "../../../UpdatePrompt.js";
import { a_node_of_test } from "../../../the_node_of_a_story/index.js";
import { a_play_starts } from "../../the_plays.js";
const a_while = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
/** The app, started as the story says; none of its wiring does anything else. The page waits a moment, for the start to be drawn. */
const AnAppStory = (props) => {
    const waited = useRef(false);
    if (!waited.current) {
        waited.current = true;
        a_play_starts(a_while(200));
    }
    return (_jsx(App, { starts: () => props.start, screens: () => _jsx(_Fragment, {}), reopens: () => undefined, clears_the_data: () => Promise.resolve() }));
};
/** A start that never ends: the app is opening. */
const never = new Promise(() => undefined);
/** A node running whose storage is told as given, stopped as the story says (never, if it does not). */
const a_node_running = (the_storage, stopped) => Promise.resolve({
    start: 'running',
    node: {
        her: a_node_of_test().node,
        the_storage,
        stops: () => Promise.resolve(),
        stopped,
    },
});
export default { title: 'Screens/The app', component: App };
export const opening = {
    render: () => _jsx(AnAppStory, { start: never }),
};
export const another_tab = {
    render: () => _jsx(AnAppStory, { start: Promise.resolve({ start: 'another_tab' }) }),
};
export const an_extension_does_not_compose = {
    render: () => (_jsx(AnAppStory, { start: Promise.resolve({
            start: 'it_does_not_start',
            why: {
                why: 'an_extension_does_not_compose',
                faults: [
                    { extension: 'ping-pong', fault: 'a_port_not_offered' },
                    { extension: 'ping-pong', fault: 'a_json_schema_not_read' },
                ],
                message: 'the extension «ping-pong» does not compose: a_port_not_offered, a_json_schema_not_read',
            },
        }) })),
};
export const an_extension_with_one_fault = {
    render: () => (_jsx(AnAppStory, { start: Promise.resolve({
            start: 'it_does_not_start',
            why: {
                why: 'an_extension_does_not_compose',
                faults: [{ extension: 'ping-pong', fault: 'a_name_not_unique' }],
                message: 'the extension «ping-pong» does not compose: a_name_not_unique',
            },
        }) })),
};
export const the_data_of_an_older_test_release = {
    render: () => (_jsx(AnAppStory, { start: Promise.resolve({
            start: 'it_does_not_start',
            why: {
                why: 'the_data_of_an_older_test_release',
                message: 'a record of the node’s storage does not read',
            },
        }) })),
};
export const a_fault = {
    render: () => (_jsx(AnAppStory, { start: Promise.resolve({
            start: 'it_does_not_start',
            why: { why: 'a_fault', message: 'the database is gone' },
        }) })),
};
export const stopped_used_elsewhere = {
    render: () => (_jsx(AnAppStory, { start: a_node_running('persistent', Promise.resolve('used_elsewhere')) })),
};
export const stopped_closed_for_a_new_release = {
    render: () => (_jsx(AnAppStory, { start: a_node_running('persistent', Promise.resolve('closed_for_a_new_release')) })),
};
export const the_storage_best_effort = {
    render: () => _jsx(AnAppStory, { start: a_node_running('best_effort', new Promise(() => undefined)) }),
};
export const the_storage_not_told = {
    render: () => _jsx(AnAppStory, { start: a_node_running('not_told', new Promise(() => undefined)) }),
};
export const the_update_proposed = {
    render: () => _jsx(TheUpdateProposed, { updates: () => undefined, later: () => undefined }),
};

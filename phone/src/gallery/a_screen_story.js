import { jsx as _jsx } from "preact/jsx-runtime";
import { TheScreens } from '@q-mino/adapters-web/screens';
import { useRef } from 'preact/hooks';
import { texts } from "../texts/index.js";
import { a_camera_of_test, a_device_of_test, a_node_of_test, a_sharing_of_test, } from "../the_node_of_a_story/index.js";
import { a_play_starts } from "./the_plays.js";
const the_ids = Array.from({ length: 64 }, (_, at) => `G${String(at + 1)}`);
const a_while = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
const until = async (check) => {
    for (let waited = 0; waited < 3000; waited += 20) {
        if (check())
            return;
        await a_while(20);
    }
    throw new Error('a story waited three seconds');
};
/** The screen shown of a frame, if it is drawn yet. */
const the_screen_shown = (root) => root?.querySelector('main > div:not([hidden]) > section') ?? null;
const a_hand = (the_root, node, camera) => {
    const shown = () => {
        const screen = the_screen_shown(the_root.current);
        if (screen === null)
            throw new Error('no screen shown');
        return screen;
    };
    return {
        node,
        camera,
        shown,
        taps: (words) => {
            const button = [...shown().querySelectorAll('button')].find((one) => one.textContent.trim() === words);
            if (button === undefined)
                throw new Error(`no button "${words}"`);
            button.click();
        },
        types: (field, text) => {
            const input = shown().querySelector(`input[name="${field}"]`);
            if (input === null)
                throw new Error(`no field "${field}"`);
            input.value = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        },
        until,
        until_it_says: (words) => until(() => (the_screen_shown(the_root.current)?.textContent ?? '').includes(words)),
        until_the_app_says: (words) => until(() => (the_root.current?.textContent ?? '').includes(words)),
    };
};
export const AScreenStory = (props) => {
    const the_root = useRef(null);
    const made = useRef(undefined);
    if (made.current === undefined) {
        const node = a_node_of_test(props.holds);
        const camera = a_camera_of_test(props.cameras);
        made.current = { node, camera };
        const hand = a_hand(the_root, node, camera);
        a_play_starts((async () => {
            await until(() => the_screen_shown(the_root.current) !== null);
            await props.plays?.(hand);
            // Her node read again after the last gesture, the screen drawn.
            await a_while(120);
        })().catch((fault) => {
            console.error(fault);
            if (the_root.current !== null)
                the_root.current.dataset['state'] = 'its_play_failed';
        }));
    }
    const { node, camera } = made.current;
    return (_jsx("div", { class: "a-screen-story", ref: the_root, children: _jsx(TheScreens, { node: node.node, device: a_device_of_test(the_ids, props.scans ?? camera.scans, a_sharing_of_test(props.shares ?? true)), texts: props.words === undefined ? texts.screens : { ...texts.screens, extensions: props.words }, ...(props.a_link === undefined ? {} : { a_link: props.a_link }), ...(props.the_relay_s_public_configuration === undefined
                ? {}
                : { the_relay_s_public_configuration: props.the_relay_s_public_configuration }) }) }));
};

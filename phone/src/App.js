import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
import { signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { why_it_does_not_start, } from "./node/index.js";
import { Flaw, Gesture, Notice, Why } from '@q-mino/adapters-web/design';
import { the_build } from "./build_info.js";
import { the_repository } from "./the_project.js";
import { texts } from "./texts/index.js";
import { UpdatePrompt } from "./UpdatePrompt.js";
// The app's frame (PWA-2, PWA-5): the node's start in this tab and what it
// came to, each a screen of its own, the kernel's screens once it runs
// (WEB-18); the storage the browser keeps or may clear, told (WEB-11, F6);
// the update with notice; where the files come from. A node that stops by
// itself (another tab took it, a new release closed it) says so and offers
// to open it here again (WEB-10). The data of an older test release (WEB-8),
// met at the start or by the screens' first reads, can be cleared on the
// test channel only: the node stopped, its database deleted, the app opened
// again.
// The commit's instant, told in the device's zone and the Italian way (A, 23 Nov 2026).
const the_time_of = (instant) => new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(Date.parse(instant));
export const App = (props) => {
    // The app's state, made at its first render, the same at every render after.
    const made = useRef(undefined);
    made.current ??= the_app_s_state(props);
    const { now, opens, clears_the_data_and_starts_again, on_the_test_channel } = made.current;
    useEffect(() => {
        opens('if_no_tab_is');
    }, []);
    const it = now.value;
    const before_the_update = async () => {
        const at_the_update = now.peek();
        if (at_the_update.now === 'running')
            await at_the_update.node.stops();
    };
    const taps = (does) => ({ does: 'taps', taps: does });
    return (_jsxs("div", { class: "app", "data-state": it.now, children: [(it.now === 'opening' || it.now === 'clearing_the_data') && (_jsx("div", { "data-part": "told", children: _jsx(Notice, { kind: "waiting", children: texts.start.opening }) })), it.now === 'another_tab' && (_jsxs("div", { "data-part": "told", children: [_jsx(Notice, { kind: "information", children: texts.start.another_tab }), _jsx(Gesture, { kind: "primary", label: texts.start.use_here, does: taps(() => {
                            opens('use_here');
                        }) })] })), it.now === 'it_does_not_start' && (_jsxs("section", { role: "alert", class: "it-does-not-start", "data-state": it.why.why, children: [it.why.why === 'an_extension_does_not_compose' && (_jsxs(_Fragment, { children: [_jsx("h1", { children: texts.start.an_extension_does_not_compose }), _jsx("ul", { children: it.why.faults.map((one, index) => (_jsx("li", { children: texts.start.the_composition_faults[one.fault](one.extension) }, index))) })] })), it.why.why === 'the_data_of_an_older_test_release' && (_jsxs(_Fragment, { children: [_jsx("h1", { children: texts.start.it_does_not_start }), _jsx("p", { children: texts.start.the_data_of_an_older_test_release }), on_the_test_channel && (_jsx(Gesture, { kind: "dangerous", label: texts.start.clear_the_data_and_start_again, does: taps(() => {
                                    clears_the_data_and_starts_again(undefined);
                                }) }))] })), it.why.why === 'a_fault' && _jsx("h1", { children: texts.start.it_does_not_start }), _jsx(Why, { title: texts.start.why, message: it.why.message })] })), it.now === 'stopped' && it.why === 'used_elsewhere' && (_jsxs("div", { "data-part": "told", children: [_jsx(Notice, { kind: "information", children: texts.start.used_elsewhere }), _jsx(Gesture, { kind: "primary", label: texts.start.use_here, does: taps(() => {
                            opens('use_here');
                        }) })] })), it.now === 'stopped' && it.why === 'closed_for_a_new_release' && (_jsxs("div", { "data-part": "told", children: [_jsx(Notice, { kind: "information", children: texts.start.closed_for_a_new_release }), _jsx(Gesture, { kind: "primary", label: texts.start.reload, glyph: "refresh_cw", does: taps(() => {
                            props.reopens();
                        }) })] })), it.now === 'running' && (_jsx(TheNodeRunning, { node: it.node, screens: props.screens, clears_the_data_and_starts_again: on_the_test_channel ? clears_the_data_and_starts_again : undefined })), _jsxs("footer", { class: "about", children: [the_build.channel !== 'release' && (_jsx("p", { "data-part": "channel", children: _jsx("strong", { children: texts.app.testChannel }) })), _jsx("h2", { children: texts.about.title }), _jsxs("p", { children: [texts.app.name, " (", texts.app.reading, ") \u00B7 ", texts.about.version, ": ", the_build.version, " \u00B7", ' ', texts.about.code, ":", ' ', _jsx("a", { href: `${the_repository}/commit/${the_build.commit}`, children: the_build.commit.slice(0, 7) }), the_build.committed_at !== 'unknown' && (_jsxs(_Fragment, { children: [" ", texts.about.committed_on(the_time_of(the_build.committed_at))] }))] })] }), _jsx(UpdatePrompt, { before_the_update: before_the_update })] }));
};
/** The app's state and its gestures: the node's start, what it came to, the data cleared. */
const the_app_s_state = (props) => {
    const now = signal({ now: 'opening' });
    /** The gesture, on the test channel only (WEB-8): on the release the sentence alone. */
    const on_the_test_channel = the_build.channel !== 'release';
    const opens = (how) => {
        now.value = { now: 'opening' };
        props.starts(how).then((start) => {
            switch (start.start) {
                case 'another_tab':
                    now.value = { now: 'another_tab' };
                    return;
                case 'it_does_not_start':
                    now.value = { now: 'it_does_not_start', why: start.why };
                    return;
                case 'running':
                    now.value = { now: 'running', node: start.node };
                    void start.node.stopped.then((why) => {
                        // Stopped to clear the data, the node is not told as stopped by itself.
                        if (now.peek().now !== 'clearing_the_data')
                            now.value = { now: 'stopped', why };
                    });
                    return;
            }
        }, (fault) => {
            now.value = { now: 'it_does_not_start', why: why_it_does_not_start(fault) };
        });
    };
    /** Her gesture on the data of an older test release (WEB-8): the node stopped, if it runs, its database deleted, the app opened again. */
    const clears_the_data_and_starts_again = (node) => {
        now.value = { now: 'clearing_the_data' };
        void (async () => {
            await node?.stops();
            await props.clears_the_data();
            props.reopens();
        })().catch((fault) => {
            now.value = { now: 'it_does_not_start', why: why_it_does_not_start(fault) };
        });
    };
    return { now, opens, clears_the_data_and_starts_again, on_the_test_channel };
};
/** The gesture on the data for this node, when the channel gives it. */
const the_gesture_on = (node, clears) => clears === undefined
    ? undefined
    : () => {
        clears(node);
    };
/** A node running: the storage told (WEB-11), and its screens, made once for it. */
const TheNodeRunning = (props) => {
    const screens = useRef(undefined);
    if (screens.current?.node !== props.node)
        screens.current = {
            node: props.node,
            drawn: props.screens(props.node, the_gesture_on(props.node, props.clears_the_data_and_starts_again)),
        };
    return (_jsxs(_Fragment, { children: [props.node.the_storage !== 'persistent' && (_jsx("div", { "data-part": "the-storage", "data-state": props.node.the_storage, children: _jsx(Flaw, { title: texts.the_storage.title, children: props.node.the_storage === 'best_effort'
                        ? texts.the_storage.best_effort
                        : texts.the_storage.not_told }) })), screens.current.drawn] }));
};

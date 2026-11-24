import { libsodium_primitives, the_reads_of_self } from '@q-mino/adapters-common';
import { ARecordOutOfItsForm, ask_to_keep_the_storage, delete_the_node_s_database, her_node_over, ids_drawn_at_random, the_node_s_storage, the_device_s_network, the_relay_s_http_transports, } from '@q-mino/adapters-web';
import { phone, TheExtensionsDoNotCompose, } from '@q-mino/memory';
import { a_phone_s_storage, the_kernel_s_domains } from "./storage.js";
/** How often the collector passes while the app is open (STK-3, PWA-2): no push in stage 1, so the phone collects while it is open. */
export const a_collect_every = 5_000;
const why_of = (fault) => (fault instanceof Error ? fault.message : String(fault));
/** A fault of the start, by its case (PWA-2): a composition's, a record out of its form (WEB-8), another. */
export const why_it_does_not_start = (fault) => fault instanceof TheExtensionsDoNotCompose
    ? {
        why: 'an_extension_does_not_compose',
        faults: fault.extensions.flatMap((each) => each.faults.map((one) => ({ extension: each.name, fault: one.fault }))),
        message: fault.message,
    }
    : fault instanceof ARecordOutOfItsForm
        ? { why: 'the_data_of_an_older_test_release', message: fault.message }
        : { why: 'a_fault', message: why_of(fault) };
/**
 * The data of an older test release cleared (WEB-8): the node's database
 * deleted, every store in it. Called once the node has stopped here (its
 * writer let go, its database closed); the app is then opened again.
 */
export const the_data_cleared = (browser, configuration) => () => delete_the_node_s_database(browser.indexed_db)(configuration.name);
const stopped = async (running) => {
    try {
        await running.stop();
    }
    catch {
        // A consumer fell before it was stopped: what it held stays in the storage (DOM-14).
    }
};
/**
 * The node's consumers while it runs (DOM-14, DOM-16, EXT-15, STK-3): every
 * executor and every reaction, the app (`user`'s executor), the extensions
 * following the office, and the collector at its pace. The post's executor
 * stops at a deposit's abort (PST-10: the effect unadvanced); it is started
 * again at the collector's next pass, as the stack's phone does.
 */
const the_node_runs = (node, time, aborted) => {
    const the_others = [
        ...Object.values(node.the_reactions).map((start) => start()),
        ...Object.entries(node.the_executors)
            .filter(([effect]) => effect !== 'post/requests')
            .map(([, start]) => start()),
        node.the_extensions_follow_the_office(),
        node.the_app(),
    ];
    let the_post = node.the_executors['post/requests']();
    let on = true;
    // The pause between two passes, cut short when the node stops.
    let wakes = () => undefined;
    const stopping = new Promise((resolve) => {
        wakes = resolve;
    });
    const a_pause = () => Promise.race([time.elapsed(a_collect_every), stopping]);
    const passes = async () => {
        while (on) {
            if (aborted()) {
                await stopped(the_post);
                the_post = node.the_executors['post/requests']();
            }
            try {
                await node.collects();
            }
            catch {
                // A mailbox not collected is left for the next pass (STK-3).
            }
            await a_pause();
        }
    };
    const passing = passes();
    return async () => {
        on = false;
        wakes();
        for (const each of [...the_others].reverse())
            await stopped(each);
        await stopped(the_post);
        for (const extension of node.extensions())
            await extension.hosted.unload();
        await passing;
    };
};
/** The post's mailbox port, which says whether a deposit aborted since it was last asked (PST-10). */
const told_when_it_aborts = (mailbox) => {
    let aborted = false;
    return {
        mailbox: {
            deposit: async (deposit) => {
                try {
                    return await mailbox.deposit(deposit);
                }
                catch (fault) {
                    aborted = true;
                    throw fault;
                }
            },
        },
        aborted: () => {
            const was = aborted;
            aborted = false;
            return was;
        },
    };
};
/** The node's start in this tab (PWA-2). */
export const the_start = (browser, configuration, time) => async (how) => {
    const opened = await the_node_s_storage(browser)({
        name: configuration.name,
        paths: the_kernel_s_domains,
        extensions: configuration.extensions.flatMap((each) => the_name_of(each.manifest)),
        characters: configuration.characters,
    }, how);
    if (opened.writer === 'another_tab') {
        opened.closes();
        return { start: 'another_tab' };
    }
    const the_storage = await ask_to_keep_the_storage(browser.storage);
    const transports = the_relay_s_http_transports({
        fetch: browser.fetch,
        elapsed: time.elapsed,
    });
    const post = told_when_it_aborts(transports.mailbox);
    const world = {
        clock: time.clock,
        elapsed: time.elapsed,
        primitives: await libsodium_primitives(),
        mailbox: post.mailbox,
        collect: transports.collect,
        extensions: configuration.extensions,
        relays: [configuration.relay],
    };
    let node;
    try {
        node = await phone(a_phone_s_storage(opened, browser.key_range))(world);
    }
    catch (fault) {
        // A composition fault (CFG-2, EXT-4): the node does not start, and lets the writer go.
        opened.let_go();
        opened.database.close();
        return { start: 'it_does_not_start', why: why_it_does_not_start(fault) };
    }
    const stops_running = the_node_runs(node, time, post.aborted);
    const draws_an_id = ids_drawn_at_random(browser.crypto);
    const her = her_node_over({
        clock: time.clock,
        draws_an_id,
        user: node.user,
        self: the_reads_of_self({
            clock: time.clock,
            self: (context, request) => node.personas().self(context, request),
        }),
        the_ticket_shown: node.the_ticket_shown,
        the_page: configuration.page,
        the_extensions_installed: () => node.extensions().map((each) => each.name),
        the_news: {
            held: async () => ({
                entries: await opened.held(),
                parts: await opened.held_parts(),
                notices: node.notices,
            }),
            traced: () => node.traced,
            tree_traced: () => node.tree_traced,
            when_written: node.when_written,
        },
        the_log: node.log,
        the_frames: {
            on_self: (extension) => node.the_extension(extension)?.on_self,
            traces: (entry) => {
                node.trace(entry);
            },
        },
        // The relay of the configuration, as the server's screen tells it, and how the client last met it (UI-5).
        the_relay: { address: configuration.relay, as_met: transports.the_relay },
        // The device's network, which tells no network apart from a relay silent (UI-5's strip).
        the_network: the_device_s_network(browser.network),
    });
    let the_end = undefined;
    const stops = () => {
        the_end ??= (async () => {
            await stops_running();
            opened.let_go();
            opened.database.close();
        })();
        return the_end;
    };
    const stopped_by_itself = Promise.race([
        opened.lost.then(() => 'used_elsewhere'),
        opened.closed.then(() => 'closed_for_a_new_release'),
    ]).then(async (why) => {
        await stops();
        return why;
    });
    return { start: 'running', node: { her, the_storage, stops, stopped: stopped_by_itself } };
};
/** An extension's name, as its manifest names it, for its partition's store (WEB-12); one with no name has none, and its composition tells the fault. */
const the_name_of = (manifest) => typeof manifest === 'object' &&
    manifest !== null &&
    'name' in manifest &&
    typeof manifest.name === 'string'
    ? [manifest.name]
    : [];

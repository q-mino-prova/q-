import * as boundary from '@q-mino/boundary';
import { a_composition_fault } from "./composition.js";
import { as_traced } from "./the_kernels_trace.js";
/**
 * How long a peer's request waits, at most, for an extension active but not
 * running yet (EXT-15, MSG-9): from the hosting's creation, at the node's
 * start, or from its load's beginning. Past it, as for an extension that
 * does not run, silence (F8).
 */
export const the_hold_of_a_request = 30_000;
/**
 * A peer's request to an extension active but not running yet (EXT-15,
 * MSG-9; [Q, C, high impact: A to discuss], 26 Nov 2026): loading, or not
 * loaded yet at the node's start. A technical outcome (DOM-15), thrown, which
 * the kernel's entry throws on, so that the collector leaves the letter
 * unseen and hands it again at its next pass, in place of a silence that
 * would wait for the asker's next sending (a quarter of its time: almost two
 * days for a message). Rejected: the silence kept (a message collected at
 * the start, while messaging loads, answered days later); the collector
 * started after the extensions' first look (a load begun while the node
 * runs, an activation, would still meet it).
 */
export class TheExtensionIsNotRunningYet extends Error {
    extension;
    constructor(extension) {
        super(`${extension} is not running yet: the request waits for it (EXT-15)`);
        this.name = 'TheExtensionIsNotRunningYet';
        this.extension = extension;
    }
}
/** A promise and the function that settles it. */
const a_promise = () => {
    let settle = () => undefined;
    const promise = new Promise((resolve) => {
        settle = resolve;
    });
    return {
        promise,
        settle: (value) => {
            settle(value);
        },
    };
};
/** The events of an invocation in flight, in order (DOM-3): given as they come, ended by `done`, or failed (a fall, an unload). */
const a_flow = () => {
    const waiting = [];
    let end = {
        end: 'open',
    };
    let wake = () => undefined;
    const ended = a_promise();
    const close = (closing) => {
        if (end.end !== 'open')
            return;
        end = closing;
        ended.settle(undefined);
        wake();
    };
    async function* events() {
        for (;;) {
            if (waiting.length > 0) {
                yield waiting.shift();
                continue;
            }
            if (end.end === 'done')
                return;
            if (end.end === 'failed')
                throw end.error;
            await new Promise((resolve) => {
                wake = resolve;
            });
        }
    }
    return {
        give: (event) => {
            waiting.push(event);
            wake();
        },
        done: () => {
            close({ end: 'done' });
        },
        fail: (error) => {
            close({ end: 'failed', error });
        },
        ended: ended.promise,
        events,
    };
};
/** A version's major. */
const major_of = (version) => Number(version.split('.')[0]);
/**
 * An extension hosted by the kernel (EXT-2, EXT-13, EXT-15), from its
 * wiring. Its realm is opened at `load`, only while it is active: its calls
 * are served while it loads (its storage read before it is `ready`), then
 * its `ready` is compared with the manifest composed (a difference is a
 * composition fault: unloaded, it does not run), and its consumers are
 * started. Its leaves are invoked by the library's mounted ports through
 * `invokes`: the kernel composes the scope of a command (on `known`, from
 * the hat and the bond's identity, `known/<bond>`, never the `Caller`; on
 * `self`, the entry's, `Caller` + hat) and the context as its manifest lets
 * it see (EXT-3: the bond, and the peer's key or the bond's name if `sees`
 * declares them). On `known` the first event its surface types is the
 * answer, and the rest are traced (EXT-15); on `self` its events go to the
 * library's port, which sets aside what its surface does not type
 * (`outside_the_surface`, traced). Its calls: the port of requests, which
 * checks what it serves; its partition, served only if `touches` names it
 * (else refused, `not_declared`, traced) and only while active. A fall (its
 * `fallen`, an exception in its realm) is traced; its invocations in flight
 * fail, a technical outcome (DOM-15) the kernel's entry turns into silence
 * for a peer (F8); it is loaded again once, and a second fall leaves it
 * stopped. Its notices go to their port; the user's requests on its dead
 * letters to it.
 */
export const a_hosted_extension = (wiring) => {
    const manifest = wiring.composed.manifest;
    const name = manifest.name;
    let life = {
        life: 'unloaded',
    };
    let falls = 0;
    let invocations = 0;
    const in_flight = new Map();
    const now = () => wiring.clock.now();
    /** Since when it is to run: the hosting's creation, at the node's start, or its last load's beginning (MSG-9). */
    let to_run_since = Date.parse(now());
    /** The realm loaded now, if any. */
    const the_realm = () => life.life === 'loading' || life.life === 'running' ? life.realm : undefined;
    /** Its invocations in flight in a realm fail: a technical outcome (DOM-15). */
    const fail_in = (realm, why) => {
        for (const [id, invocation] of in_flight) {
            if (invocation.realm !== realm)
                continue;
            invocation.flow.fail(new Error(`${name}: ${why} (EXT-15)`));
            in_flight.delete(id);
        }
    };
    /** Its partition, served only if declared and while active (EXT-4, EXT-14). */
    const its_storage = async (request) => {
        if (!manifest.touches.includes('its_storage')) {
            wiring.trace({
                why: 'a_call_not_declared',
                extension: name,
                now: now(),
                call: { port: 'its_storage', request: as_traced(request) },
            });
            return { answer: 'refused', why: 'not_declared' };
        }
        if (!(await wiring.is_active()))
            return { answer: 'refused', why: 'not_active' };
        return request.call === 'read'
            ? wiring.its_storage.read(request.read)
            : wiring.its_storage.commit(request.writes);
    };
    /** A call of the extension's, answered under its id if its realm is still loaded; a call the kernel cannot serve is traced, unanswered. */
    const serve = async (realm, call) => {
        try {
            const answer = call.port === 'the_port_of_requests'
                ? {
                    message: 'answer',
                    id: call.id,
                    port: call.port,
                    answer: await wiring.the_port_of_requests(call.request),
                }
                : {
                    message: 'answer',
                    id: call.id,
                    port: call.port,
                    answer: await its_storage(call.request),
                };
            if (the_realm() === realm)
                realm.to_the_extension(answer);
        }
        catch (error) {
            wiring.trace({
                why: 'a_call_not_answered',
                extension: name,
                now: now(),
                call: { port: call.port, request: as_traced(call.request) },
                fault: error instanceof Error ? error.message : String(error),
            });
        }
    };
    /** An event of an invocation in flight: on `self` given on; on `known` the first its surface types is the answer, the rest traced (EXT-15). */
    const an_event = (realm, event) => {
        const invocation = in_flight.get(event.id);
        if (invocation?.realm !== realm) {
            not_in_the_boundary(event, 'pairs_no_exchange');
            return;
        }
        if (invocation.persona === 'self') {
            invocation.flow.give(event.event);
            return;
        }
        const leaf = wiring.composed.surfaces.known?.majors[major_of(invocation.version)]?.[invocation.leaf];
        const schema = leaf?.events[event.event.event];
        if (!invocation.answered && schema?.safeParse(event.event).success === true) {
            invocation.answered = true;
            invocation.flow.give(event.event);
            return;
        }
        wiring.trace({
            why: 'an_event_not_in_the_surface',
            extension: name,
            now: now(),
            persona: 'known',
            leaf: invocation.leaf,
            version: invocation.version,
            event: event.event,
            the_event_is: invocation.answered ? 'after_the_answer' : 'not_typed',
        });
    };
    /** A message of the extension's the boundary does not carry, or that pairs no exchange: traced (EXT-2). */
    const not_in_the_boundary = (message, the_message) => {
        wiring.trace({
            why: 'a_message_not_in_the_boundary',
            extension: name,
            now: now(),
            message: as_traced(message),
            the_message,
        });
    };
    /** A message from a realm: dropped once the realm is unloaded; parsed by the boundary; handed to what it pairs. */
    const received = (realm) => (message) => {
        if (the_realm() !== realm)
            return;
        const parsed = boundary.a_message_from_an_extension.safeParse(message);
        if (!parsed.success) {
            not_in_the_boundary(message, 'does_not_parse');
            return;
        }
        const from = parsed.data;
        switch (from.message) {
            case 'ready':
                if (life.life === 'loading')
                    realm.first({ came: 'ready', ready: from });
                else
                    not_in_the_boundary(from, 'pairs_no_exchange');
                return;
            case 'fallen':
                if (life.life === 'loading')
                    realm.first({ came: 'fallen', why: from.why });
                else
                    void fell(realm, from.why);
                return;
            case 'event':
                an_event(realm, from);
                return;
            case 'done': {
                const invocation = in_flight.get(from.id);
                if (invocation?.realm !== realm) {
                    not_in_the_boundary(from, 'pairs_no_exchange');
                    return;
                }
                invocation.flow.done();
                in_flight.delete(from.id);
                return;
            }
            case 'call':
                void serve(realm, from);
                return;
            case 'dead_letter':
            case 'released':
            case 'traced':
                wiring.notices({ extension: name, notice: from });
                return;
        }
    };
    /** A realm opened by the transport, `ready` or its fall awaited. */
    const a_realm = () => {
        const came = a_promise();
        let opened = undefined;
        const realm = {
            to_the_extension: (message) => opened?.to_the_extension(message),
            unload: () => opened?.unload(),
            came: came.promise,
            first: came.settle,
        };
        life = { life: 'loading', realm };
        to_run_since = Date.parse(now());
        opened = wiring.transport(received(realm));
        return realm;
    };
    /** A fall (EXT-15): traced, its invocations in flight failed, its realm unloaded; loaded again once, else stopped. */
    const fell = async (realm, because) => {
        if (the_realm() !== realm)
            return loaded_now();
        falls += 1;
        wiring.trace({
            why: 'the_extension_has_fallen',
            extension: name,
            now: now(),
            fall: falls === 1 ? 'the_first' : 'the_second',
            because,
        });
        life = { life: 'unloaded' };
        fail_in(realm, `it has fallen, ${because}`);
        realm.unload();
        if (falls > 1) {
            life = { life: 'stopped', why: 'it_fell_twice' };
            return { loaded: 'stopped' };
        }
        return loaded();
    };
    /** What loading came to, from its life now (a load overtaken by an unload or a fall). */
    const loaded_now = () => life.life === 'running'
        ? { loaded: 'running' }
        : life.life === 'stopped'
            ? { loaded: 'stopped' }
            : { loaded: 'unloaded' };
    /** A realm loaded, its `ready` compared with the manifest, its consumers started. */
    const loaded = async () => {
        const realm = a_realm();
        const came = await realm.came;
        if (the_realm() !== realm)
            return loaded_now();
        if (came.came === 'fallen')
            return fell(realm, came.why);
        const ready = came.ready;
        if (ready.name !== manifest.name ||
            ready.version !== manifest.version ||
            ready.boundary_version !== manifest.boundary_version) {
            life = { life: 'stopped', why: 'its_ready_differs' };
            realm.unload();
            return {
                loaded: 'a_composition_fault',
                fault: a_composition_fault(name, [
                    {
                        fault: 'a_ready_that_differs',
                        ready: {
                            name: ready.name,
                            version: ready.version,
                            boundary_version: ready.boundary_version,
                        },
                    },
                ]),
            };
        }
        life = { life: 'running', realm };
        realm.to_the_extension({ message: 'start' });
        return { loaded: 'running' };
    };
    /** An invocation of a leaf on a persona, through the boundary (EXT-2). */
    async function* invoked(persona, invocation) {
        if (life.life !== 'running') {
            const to_run = persona === 'known' &&
                (life.life === 'loading' || life.life === 'unloaded') &&
                Date.parse(now()) - to_run_since < the_hold_of_a_request &&
                (await wiring.is_active());
            if (to_run)
                throw new TheExtensionIsNotRunningYet(name);
            throw new Error(`${name} is not running, ${life.life}: it invokes nothing (EXT-15)`);
        }
        const realm = life.realm;
        const seen = persona === 'known' ? wiring.the_bond_on_known(invocation.context) : undefined;
        const sees = manifest.sees.known;
        const context = seen === undefined
            ? {}
            : {
                bond: seen.bond,
                ...(sees.includes('the_peer_key') ? { peer_key: seen.peer_key } : {}),
                ...(sees.includes('the_name_of_the_bond') ? { bond_name: seen.bond_name } : {}),
                ...(sees.includes('the_declared_time')
                    ? { declared_at: wiring.the_declared_time_on_known(invocation.context) }
                    : {}),
            };
        const operation = invocation.operation === undefined
            ? undefined
            : seen === undefined
                ? { id: invocation.operation.id, scope: invocation.operation.scope }
                : { id: invocation.operation.id, scope: `known/${seen.bond}` };
        const input = boundary.json.parse(invocation.input);
        invocations += 1;
        const id = `invocation-${String(invocations)}`;
        const flow = a_flow();
        in_flight.set(id, {
            realm,
            persona,
            leaf: invocation.leaf,
            version: invocation.version,
            answered: false,
            flow,
        });
        realm.to_the_extension({
            message: 'invoke',
            id,
            persona,
            use_case: invocation.leaf,
            version: invocation.version,
            context,
            ...(operation === undefined ? {} : { operation }),
            ...(invocation.correlation === undefined ? {} : { correlation: invocation.correlation }),
            input,
        });
        yield* flow.events();
    }
    /** The user's request on a dead letter, handed to the extension while it runs. */
    const handed = (message) => {
        if (life.life !== 'running')
            return 'not_running';
        life.realm.to_the_extension(message);
        return 'handed';
    };
    return {
        load: async () => {
            if (life.life === 'running')
                return { loaded: 'running' };
            if (!(await wiring.is_active()))
                return { loaded: 'not_active' };
            if (life.life === 'loading') {
                await life.realm.came;
                return loaded_now();
            }
            falls = 0;
            return loaded();
        },
        unload: async () => {
            const realm = the_realm();
            if (realm === undefined)
                return;
            if (life.life === 'running') {
                realm.to_the_extension({ message: 'stop' });
                const flows = [...in_flight.values()]
                    .filter((invocation) => invocation.realm === realm)
                    .map((invocation) => invocation.flow.ended);
                await Promise.race([Promise.all(flows), wiring.a_while()]);
            }
            life = { life: 'unloaded' };
            fail_in(realm, 'it has been unloaded');
            realm.unload();
            // A load still waiting for its `ready` ends: its realm is no longer the one loaded.
            realm.first({ came: 'fallen', why: 'it has been unloaded' });
        },
        invokes: (persona) => (invocation) => invoked(persona, invocation),
        outside_the_surface: (persona) => (event) => {
            wiring.trace({
                why: 'an_event_not_in_the_surface',
                extension: name,
                now: now(),
                persona,
                leaf: event.leaf,
                version: event.version,
                event: as_traced(event.event),
                the_event_is: 'not_typed',
            });
        },
        redeliver: (letter) => handed({ message: 'redeliver', letter }),
        discard: (letter, trace) => handed({ message: 'discard', letter, by: trace.by, reason: trace.reason }),
        life: () => (life.life === 'loading' || life.life === 'running' ? { life: life.life } : life),
    };
};

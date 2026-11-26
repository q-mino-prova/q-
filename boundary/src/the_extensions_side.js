import * as z from 'zod';
import { an_event, a_message_to_an_extension, } from "./messages.js";
import { an_answer_to_a_commit, an_answer_to_a_read, an_answer_to_a_request, } from "./ports.js";
import { json } from "./values.js";
import { version as boundary_version } from "./version.js";
/** A value's JSON text; nothing for `undefined` or a function, which `JSON.stringify`'s type does not tell. */
const stringified = (value) => JSON.stringify(value);
/** A value as a message carries it: JSON as `JSON.stringify` writes it (a field `undefined` left out), or its text where it is none. */
const as_json = (value) => {
    try {
        const written = stringified(value);
        return json.parse(written === undefined ? null : JSON.parse(written));
    }
    catch {
        return String(value);
    }
};
/** An error's message, or the value's text. */
const why = (error) => (error instanceof Error ? error.message : String(error));
/**
 * The extension's side of the boundary (EXT-2, EXT-15): from its name and
 * version (its manifest's), its declaration's `touches`, the way it sends a
 * message to the kernel, and its configurator, given the ports its manifest
 * names (`PortsOf`) and its notices. Each message the kernel sends is given
 * to `receive`, at once: its configurator builds it over its ports, whose
 * answers come in through `receive`, then it says it is `ready`, with the
 * boundary version it was built with (a configurator that throws makes it
 * `fallen`), and every other message waits for it:
 * - `invoke`: the leaf's events, each an `event` paired by the invocation's
 *   id, then `done`; an event that is no JSON object named by `event` is
 *   traced, not sent (the kernel would trace it, EXT-15); an invocation that
 *   throws makes the extension `fallen`;
 * - `end` (K-4): the invocation its id names, still in flight, ended: no
 *   event of it is sent any more, `return()` is asked of its leaf's
 *   iterator (a leaf's generator waiting for its next event finishes that
 *   step first: so the library's streams, which stop at their next turn),
 *   and `done` sent; one no longer in flight, nothing;
 * - `answer`: the answer of the call its id names, parsed by the port's
 *   answer; one that names no call, or that does not parse, is traced;
 * - `start`, `stop`, `redeliver`, `discard`: handed to what was built.
 * A message that does not parse is traced: the kernel's fault, which the
 * extension cannot answer.
 */
export const the_extensions_side = (made) => {
    const waiting = new Map();
    let calls = 0;
    const notices = {
        dead_letter: (letter) => {
            made.send({
                message: 'dead_letter',
                letter: letter.letter,
                of: letter.of,
                path: letter.path,
                entry: as_json(letter.entry),
                cause: as_json(letter.cause),
            });
        },
        released: (letter) => {
            made.send({ message: 'released', letter });
        },
        traced: (entry) => {
            made.send({ message: 'traced', entry: as_json(entry) });
        },
    };
    /** A call to a port: its message sent under a new id, its answer parsed by the port's (a kernel's answer that does not parse rejects it). */
    const call = (port, message, answer) => new Promise((resolve, reject) => {
        calls += 1;
        const id = `call-${String(calls)}`;
        waiting.set(id, {
            port,
            settle: (given) => {
                const parsed = answer.safeParse(given);
                if (parsed.success)
                    resolve(parsed.data);
                else
                    reject(new Error(`the answer to ${id} is not ${port}'s (EXT-2)`));
            },
        });
        made.send(message(id));
    });
    const ports = {
        the_port_of_requests: (request) => call('the_port_of_requests', (id) => ({ message: 'call', id, port: 'the_port_of_requests', request }), an_answer_to_a_request),
        its_storage: {
            read: (read) => call('its_storage', (id) => ({ message: 'call', id, port: 'its_storage', request: { call: 'read', read } }), an_answer_to_a_read),
            commit: (writes) => call('its_storage', (id) => ({
                message: 'call',
                id,
                port: 'its_storage',
                request: { call: 'commit', writes },
            }), an_answer_to_a_commit),
        },
    };
    // Built while its storage's answers come in: `receive` is given at once,
    // and every message but an answer waits for it.
    const built = made.configurator({ ports, notices }).then((extension) => {
        made.send({ message: 'ready', name: made.name, version: made.version, boundary_version });
        return extension;
    }, (error) => {
        made.send({ message: 'fallen', why: why(error) });
        return undefined;
    });
    /** The invocations in flight, by their id: how each is ended by the kernel (K-4). */
    const in_flight = new Map();
    const invoked = async (extension, id, invocation) => {
        const iterator = extension.invoke(invocation)[Symbol.asyncIterator]();
        const ended = new Promise((resolve) => {
            in_flight.set(id, () => {
                resolve('ended');
            });
        });
        try {
            for (;;) {
                const step = iterator.next();
                // A step overtaken by the end settles later: its fault, if any, is no longer the flow's.
                void step.catch(() => undefined);
                const next = await Promise.race([step, ended]);
                if (next === 'ended') {
                    void iterator.return?.().catch((error) => {
                        notices.traced({ an_invocation_not_ended: { id, why: why(error) } });
                    });
                    break;
                }
                if (next.done === true)
                    break;
                const event = an_event.safeParse(as_json(next.value));
                if (event.success)
                    made.send({ message: 'event', id, event: event.data });
                else
                    notices.traced({ an_event_not_sent: { id, event: as_json(next.value) } });
            }
            made.send({ message: 'done', id });
        }
        catch (error) {
            made.send({ message: 'fallen', why: why(error) });
        }
        finally {
            in_flight.delete(id);
        }
    };
    const receive = async (message) => {
        const parsed = a_message_to_an_extension.safeParse(message);
        if (!parsed.success) {
            notices.traced({ a_message_not_parsed: as_json(message) });
            return;
        }
        const received = parsed.data;
        if (received.message === 'answer') {
            const call_waiting = waiting.get(received.id);
            if (call_waiting?.port !== received.port) {
                notices.traced({ an_answer_to_no_call: as_json(received) });
                return;
            }
            waiting.delete(received.id);
            call_waiting.settle(received.answer);
            return;
        }
        const extension = await built;
        if (extension === undefined)
            return;
        switch (received.message) {
            case 'invoke':
                await invoked(extension, received.id, {
                    persona: received.persona,
                    use_case: received.use_case,
                    version: received.version,
                    context: received.context,
                    input: received.input,
                    ...(received.operation === undefined ? {} : { operation: received.operation }),
                    ...(received.correlation === undefined ? {} : { correlation: received.correlation }),
                });
                return;
            case 'end':
                in_flight.get(received.id)?.();
                return;
            case 'start':
                extension.start();
                return;
            case 'stop':
                await extension.stop();
                return;
            case 'redeliver':
                await extension.redeliver(received.letter);
                return;
            case 'discard':
                await extension.discard(received.letter)({ by: received.by, reason: received.reason });
                return;
        }
    };
    return { receive };
};

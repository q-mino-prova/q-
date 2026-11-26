import * as zz from '@q-mino/domains/library';
import { a_letter_in_an_envelope, the_identity_of_the_response_to, the_letter_in_an_envelope, the_operation_of_a_deposit, } from '@q-mino/domains/post/_dsl.ts';
import { content } from '@q-mino/domains/post/_value.ts';
import { as_traced, route, TheExtensionIsNotRunningYet, } from "../extensions/index.js";
// The kernel's entry (EXT-6, F7, F8, PST-4, PST-7, PST-9, PER-5, PER-23;
// part 13.2): one envelope collected at a mailbox of mine at a time, opened
// by the face of mine at that mailbox (PST-4), or traced as an envelope not
// opened; a response goes to the request it names (PST-7), never to a
// persona; a request is routed by what it invokes (EXT-6): to the kernel's
// persona, by the leaf's path; to an extension's leaves mounted on that
// persona; or nowhere, the node silent (F8), traced. The first event of the
// leaf is the response, answered on the bond of the `Caller`'s key, written,
// sealed and deposited once (PST-9). Its wiring is functions, so that the
// oracle and the phone wire it alike. A fault of a port throws: the
// collector does not advance its position, and a second pass meets the
// duplicate branches (DOM-11), so it is the same.
/** The scope of the kernel's entry's operations (DOM-11): the entry takes a response under the response's identity. */
export const the_scope_of_the_kernels_entry = 'the_kernel_s_entry';
/** The path of the post's use case the entry invokes for a response, for the fingerprint (LIB-10). */
const taking = 'post/requests/usecase/take_a_response';
/**
 * The scope of a request's operation (DOM-11): the persona it names and who
 * asks, the key of a face, or the id of an anonymous letter (PER-4), so that
 * a face sending again meets its operation, and each anonymous envelope is
 * an operation of its own.
 */
export const the_scope_of_a_letter = (persona_named, caller) => `${persona_named}/${caller.is === 'a_face' ? caller.key : caller.id}`;
/** The first event of a stream, its rest let go; none for a stream that ends with none. */
const the_first_event_of = async (events) => {
    for await (const event of events)
        return event;
    return undefined;
};
/** The last event of a stream, once it ends: a command's outcome. */
const the_last_of = async (events) => {
    let last = undefined;
    for await (const event of events)
        last = event;
    return last;
};
/**
 * The persona's `Caller` from the post's (PER-23): a face, by its key, to
 * the mailbox of mine the letter came to; anonymous, its id and its
 * annotation, to that mailbox.
 */
const the_personas_caller = (caller, came_to) => caller.is === 'a_face'
    ? { is: 'a_face', key: caller.key, to_my_mailbox: came_to }
    : { is: 'anonymous', id: caller.id, annotation: caller.annotation, to_my_mailbox: came_to };
/**
 * The kernel's entry (EXT-6; part 13.2), one envelope at a time:
 * 1. an envelope came: opened by the face of mine at the mailbox it came
 *    to; none, or every outcome of `post` but `opened`, traced
 *    (`an_envelope_not_opened`), never further (PST-4);
 * 2. a response came (F7, PST-7): an anonymous one never taken, traced;
 *    else taken under its identity in the entry's scope, and what is not
 *    applied traced (`a_response_not_awaited`, with what `post` answered);
 * 3. a request came: routed (`route`, F8; an anonymous `Caller`, or a face
 *    whose offers are not known, has none offered); silent, traced with
 *    its case; to the kernel, its persona's tree by the leaf's path; to an
 *    extension, its leaves mounted on that persona, none `invalid_request`,
 *    `not_a_leaf` (EXT-4), traced; the context the `Caller`, the version
 *    the request names, its operation (its identity, in the scope of the
 *    persona and who asks) and its correlation (its identity). The answer
 *    is the leaf's first event; an extension's invocation that throws (it
 *    fell, it is not running) answers nothing (F8, EXT-15), the request
 *    traced as not answered (F6), the fall the hosting's;
 * 4. the answer on the bond (F7, PST-9): only to a face; no bond with it at
 *    that mailbox, none; an event over what a letter carries (the post's
 *    `content`, PST-12), never sealed nor deposited, traced
 *    (`a_response_not_deposited`, `too_large_for_a_letter`): the asker
 *    reads `no_response` at its time (A, 23 Nov 2026); else the response
 *    written from my face to their mailbox, sealed for their key and
 *    deposited once under the operation of PST-11; not sealed, refused or
 *    unreachable, traced (`a_response_not_deposited`): the asker's sending
 *    again asks again (PST-6).
 * A fault of a port, the kernel's trees included, throws.
 */
export const the_kernels_entry = (wiring) => {
    const now = () => wiring.clock.now();
    const when = () => ({
        now: wiring.clock.now(),
        time_zone: wiring.clock.time_zone,
    });
    /** 1. An envelope came (PST-4): the letter, its `Caller` and the machine that opened it, or why it goes no further. */
    const an_envelope_came = async (collected) => {
        const machine = await wiring.the_machine_at_my_mailbox(collected.came_to);
        if (machine === undefined)
            return { outcome: 'no_face_of_mine_at_the_mailbox' };
        const opened = await the_letter_in_an_envelope(machine)(collected.came_to, collected.envelope);
        switch (opened.outcome) {
            case 'opened':
                return { outcome: 'opened', letter: opened.letter, caller: opened.caller, machine };
            case 're_addressed':
                return {
                    outcome: 're_addressed',
                    letter: opened.letter.identity,
                    signed_by: opened.signed_by,
                };
            default:
                return { outcome: opened.outcome };
        }
    };
    /** 2. A response came (F7, PST-7): taken under its identity, or annotated; never a persona. */
    const a_response_came = async (response, caller) => {
        const as_it_came = { letter: response.identity, answers: response.answers, caller, now: now() };
        if (caller.is === 'anonymous') {
            wiring.trace({
                why: 'a_response_not_awaited',
                response: as_it_came,
                answered: 'anonymous, never taken',
            });
            return;
        }
        const input = { request_id: response.answers, from: caller.key, event: response.event };
        const outcomes = wiring.post.take_a_response({
            ...when(),
            operation: {
                id: zz.operation_id.parse(response.identity),
                scope: the_scope_of_the_kernels_entry,
            },
            // The chain of the request it answers (DOM-10), whose identity the port sent it under.
            correlation: zz.correlation.parse(response.answers),
            fingerprint: zz.fingerprint_of({ path: taking, input }),
        }, input);
        const taken = await the_last_of(outcomes);
        if (taken?.outcome === 'applied')
            return;
        wiring.trace({
            why: 'a_response_not_awaited',
            response: as_it_came,
            answered: as_traced(taken),
        });
    };
    /** The extensions offered to the bond of who asks (EXT-6): none for an anonymous letter, nor for a face whose offers are not known (F8). */
    const offered_to = async (caller, came_to) => {
        if (caller.is === 'anonymous')
            return [];
        const offered = await wiring.routing.offered_to_the_bond_of_the_caller({
            face: caller.key,
            mailbox: came_to,
        });
        return offered.answer === 'known' ? offered.value : [];
    };
    /** The request routed by what it invokes (EXT-6, F8), before the gate. */
    const routed_by_what_it_invokes = async (asked) => {
        const installed = await wiring.routing.installed();
        return route({
            invokes: asked.request.invokes,
            installed,
            active: await wiring.routing.the_active_among(installed),
            offered_to_the_bond_of_the_caller: await offered_to(asked.caller, asked.came_to),
        });
    };
    /**
     * 3. A request came (EXT-6, F8): its answer, the leaf's first event; none
     * for a silence, traced, or an extension's invocation that throws.
     */
    const a_request_came = async (asked) => {
        const { request, caller } = asked;
        const as_it_came = {
            invokes: request.invokes,
            letter: request.identity,
            caller,
            now: now(),
            version: request.invokes.version,
        };
        const routed = await routed_by_what_it_invokes(asked);
        const context = {
            ...when(),
            caller: the_personas_caller(caller, asked.came_to),
            declared_at: request.declared_at,
            version: zz.semver.parse(request.invokes.version),
            operation: {
                id: zz.operation_id.parse(request.identity),
                scope: the_scope_of_a_letter(request.invokes.persona, caller),
            },
            correlation: zz.correlation.parse(request.identity),
        };
        const leaf = { leaf: request.invokes.use_case, input: request.input };
        switch (routed.routed) {
            case 'to_silence':
                wiring.trace({ why: routed.why, request: as_it_came });
                return undefined;
            case 'to_the_kernel':
                return the_first_event_of(wiring.the_personas[request.invokes.persona](context, leaf));
            case 'to_an_extension': {
                const leaves = wiring.the_leaves_of_an_extension(routed.extension, request.invokes.persona);
                if (leaves === undefined) {
                    wiring.trace({ why: 'not_a_leaf_of_the_extension', request: as_it_came });
                    return { event: 'invalid_request', reason: 'not_a_leaf' };
                }
                try {
                    return await the_first_event_of(leaves(context, leaf));
                }
                catch (fault) {
                    // Active, not running yet (EXT-15, MSG-9): the letter waits for the collector's next pass.
                    if (fault instanceof TheExtensionIsNotRunningYet)
                        throw fault;
                    // It fell, or it is not running: no response (F8, EXT-15). The hosting traces a fall;
                    // the request unanswered is the entry's to trace (F6), a fall or not.
                    wiring.trace({
                        why: 'a_request_not_answered',
                        request: as_it_came,
                        because: fault instanceof Error ? fault.message : String(fault),
                    });
                    return undefined;
                }
            }
        }
    };
    /** 4. The answer on the bond (F7, PST-9): written, sealed and deposited once, or traced. */
    const answered_on_the_bond = async (asked, event) => {
        const { request, caller, machine } = asked;
        if (caller.is !== 'a_face')
            return;
        const bond = await wiring.the_bond_to_answer_on({ face: caller.key, mailbox: asked.came_to });
        if (bond.bond === 'none')
            return;
        const identity = the_identity_of_the_response_to(machine)(request.identity);
        const their_mailbox = bond.to.mailbox;
        const response = {
            is: 'a_response',
            schema: 1,
            identity,
            from: bond.from.key,
            to: their_mailbox.deposit_address,
            declared_at: now(),
            answers: request.identity,
            event,
        };
        const not_deposited = { letter: identity, answers: request.identity, caller, now: now() };
        if (!content.safeParse(event).success) {
            // PST-12: a letter the relay would keep and the asker could not open (`not_a_letter`).
            wiring.trace({
                why: 'a_response_not_deposited',
                response: not_deposited,
                answered: { outcome: 'too_large_for_a_letter' },
            });
            return;
        }
        const sealed = await a_letter_in_an_envelope(wiring.machine_of(bond.from.face_id))(response, bond.to.key);
        if (sealed.outcome === 'not_sealed') {
            wiring.trace({
                why: 'a_response_not_deposited',
                response: not_deposited,
                answered: { outcome: 'not_sealed' },
            });
            return;
        }
        const deposited = await wiring.post.mailbox.deposit({
            operation: the_operation_of_a_deposit(machine)(identity, their_mailbox.deposit_address),
            deposit_address: their_mailbox.deposit_address,
            relays: [...their_mailbox.relays],
            envelope: sealed.envelope,
        });
        switch (deposited.outcome) {
            case 'kept':
            case 'kept_already':
                return;
            case 'refused':
            case 'unreachable':
                wiring.trace({
                    why: 'a_response_not_deposited',
                    response: not_deposited,
                    answered: deposited,
                });
        }
    };
    return async (collected) => {
        const opened = await an_envelope_came(collected);
        if (opened.outcome !== 'opened') {
            // PST-4, F6: it goes no further, traced.
            wiring.trace({
                why: 'an_envelope_not_opened',
                came_to: collected.came_to,
                now: now(),
                opened,
            });
            return;
        }
        const { letter, caller, machine } = opened;
        if (letter.is === 'a_response') {
            await a_response_came(letter, caller);
            return;
        }
        const asked = { request: letter, caller, came_to: collected.came_to, machine };
        const answer = await a_request_came(asked);
        if (answer !== undefined)
            await answered_on_the_bond(asked, answer);
    };
};

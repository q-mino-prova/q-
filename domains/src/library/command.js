import * as z from 'zod';
import { mark } from "./kind.js";
export const $Composition = Symbol('Composition');
export const $Each = Symbol('Each');
/** The identity of an outbox entry (DOM-13, D48): written by the domain, the key sent outside with its effect. */
export const entry_id = z.string().min(1).brand();
export const $Command = Symbol('Command');
/**
 * Whether a value is a command, a builder's (`$Command`), as a port meets
 * one at runtime: a step's transition (DOM-20); a type guard over exactly
 * what it checks, its mark and the record under it.
 */
export const is_a_command = (value) => {
    if ((typeof value !== 'function' && typeof value !== 'object') || value === null)
        return false;
    const declared = $Command in value ? value[$Command] : undefined;
    return typeof declared === 'object' && declared !== null && !Array.isArray(declared);
};
// The builders' bodies (part 3.2): a command is its creator, with its input as
// declared and its branches; the context is the types', the same function at
// every point.
export const command_builder = () => (command) => Object.assign((context) => command.creator(context), { input: command.input, [$Command]: { outcomes: command.outcomes } }, mark({ kind: 'command' }));
/**
 * Some members of a namespace, under their own names: the outbox entries of a
 * branch are its effects by name, `pick(effect, 'wait_until_the_due_date')`
 * for `{ wait_until_the_due_date: effect.wait_until_the_due_date }`. A name
 * the namespace does not export does not compile. Not a builder: it builds no
 * component, it names some.
 */
export const pick = (namespace, ...names) => {
    const picked = Object.fromEntries(names.map((name) => [name, namespace[name]]));
    if (picks(namespace, names)(picked))
        return picked;
    throw new Error(`pick: the namespace does not export ${names.join(', ')}`);
};
/**
 * Whether an object holds the members of a namespace under their names, each
 * the namespace's own: checked member by member, by identity.
 */
const picks = (namespace, names) => (picked) => names.every((name) => Object.hasOwn(picked, name) && picked[name] === namespace[name]);
/**
 * The transitions a branch composes, by name, as its outbox entries are by
 * name (`pick`): `composes({ the_reservation_is_taken_up:
 * take_up_a_reservation })`, the creator giving each its input under the same
 * name (A, 17 Nov 2026, SC-10). Not a builder: it builds no component, it
 * names the transitions a branch applies.
 *
 * Gianni takes the drill he booked for Thursday: the branch lends it and
 * composes the taking up of his reservation, one fact in two parts, the
 * branch's own then one per transition, in the order written. The branch
 * applies when its condition and a branch of each transition hold, the
 * first in their order: the conditions of a transition are part of the
 * branch, as in the choice of a step (D112.2); a rejection names the failed
 * predicates of both. The instance comes from the input, never from a read:
 * a creator reads no state, and whoever invokes has read it (Gianni's phone
 * names his reservation, which the transition's condition checks).
 */
export const composes = (transitions) => ({ [$Composition]: transitions });
/**
 * A transition composed on each element of a list (SC-54; A, 18 Nov 2026
 * (6)): `composes({ its_lines_are_loaded: each(add_a_tool_from_a_line) })`,
 * the creator giving a list of inputs under the same name, one per element,
 * in the order of the list. Not a builder: it builds no component, it says
 * that the transition goes over a list.
 *
 * Paolo gives the shed twelve tools on a short sheet, and Luca loads it in
 * one go: one fact, the branch's own part, then one part per line, the
 * branch each line applies (D113.1-2), the tool added or the line left
 * (D95). Each element applies its own branch, the first that holds, with no
 * combination between the elements' branches (D113.1), every element
 * reading the state as it was before the command: so a list names each
 * instance once, which its schema checks (D113, the parts of a list of ids
 * without repeats). The branch applies when its condition holds and a
 * branch of the transition holds on every element: all or nothing (D113.1,
 * D97, the corollary on known ids).
 */
export const each = (transition) => ({ [$Each]: transition });

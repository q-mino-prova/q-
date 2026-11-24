// The reference interpreter of q- (V10, TST-2): what a command and a read
// mean, over the state of a cell, with the interpreter rules (LIB-9,
// DOM-17). Generic over the state: each domain's module gives its fragments,
// its sources and its writes, from its `dsl` (DOM-5). On the model of Shed's
// (`test/shed/adapter/memory/index.ts`), which is a test tree's and stays
// apart (LIB-2): this one is q-'s, and runs in the `memory` stack.
import * as zz from '@q-mino/domains/library';
/** AND, OR, NOT over the conditions of a command, and its predicates' fragments. */
export const algebra = (predicate) => ({
    predicate,
    and: (components) => (state) => components.every((component) => component(state)),
    or: (components) => (state) => components.some((component) => component(state)),
    not: (operand) => (state) => !operand(state),
});
/** AND, OR, NOT over the selections of one subject. */
export const selection_operators = () => ({
    and: (components) => (state) => (candidate) => components.every((component) => component(state)(candidate)),
    or: (components) => (state) => (candidate) => components.some((component) => component(state)(candidate)),
    not: (operand) => (state) => (candidate) => !operand(state)(candidate),
});
/** A state after a fact's writes, in the order of its parts (DOM-10). */
const after_writes = (state) => (writes) => writes.reduce((before, write) => ({ ...before, ...write(before) }), state);
/** The fact an operation already recorded, as the duplicate branch gives it back (DOM-11). */
const already_recorded = (recorded) => ({
    outcome: 'recorded',
    position: recorded.position,
    fact: recorded.fact,
});
/** The fact an operation recorded, looked up alone (PER-5): the duplicate branch read before anything is parsed. */
export const recorded = (cell) => (operation) => {
    const found = cell.recorded_by(operation);
    return Promise.resolve(found === undefined ? undefined : already_recorded(found));
};
/** The branch of the transition each element of a list applies, the first that holds, -1 where none does (SC-54). */
const chosen = (state) => (branch) => 'elements' in branch
    ? branch.elements.map((element) => element.findIndex((each) => each.condition(state)))
    : [];
/** A branch holds: its condition, and, over a list, a branch of the transition on every element (SC-54). */
const holds = (state) => (branch) => branch.condition(state) && chosen(state)(branch).every((index) => index !== -1);
/** What a branch writes: a plain branch its own, a branch over a list the library's from the choice (SC-54). */
const written = (branch, elements) => ('elements' in branch ? branch.applies(elements) : branch);
/** Every leaf of a branch: its own, then, over a list, each element's branches' (SC-54). */
const leaves = (branch) => [
    ...branch.leaves,
    ...('elements' in branch
        ? branch.elements.flatMap((element) => element.flatMap((each) => each.leaves))
        : []),
];
/**
 * A serial writer (DOM-9): the operation looked up, then every branch and
 * every leaf read on one state; the first branch that holds writes; if none
 * does, the leaves name the failures. Nothing awaits between the reads and
 * the write: the outcomes of a serial order, by construction (SC-11). An
 * interpreter rule: the oracle never awaits inside an execution.
 */
export const execute = (cell) => (plan) => {
    const found = cell.recorded_by(plan.operation);
    if (found !== undefined) {
        return Promise.resolve(already_recorded(found));
    }
    const state = cell.get();
    const applied = plan.branches.findIndex(holds(state));
    const branch = plan.branches[applied];
    if (branch === undefined) {
        return Promise.resolve({
            outcome: 'rejected',
            leaves: plan.branches.map((planned) => leaves(planned).map((leaf) => leaf(state))),
        });
    }
    const elements = chosen(state)(branch);
    const write = written(branch, elements);
    cell.record({
        fact: write.fact,
        entries: write.entries,
        state: after_writes(state)(write.writes),
    });
    return Promise.resolve({
        outcome: 'applied',
        branch: applied,
        elements,
        position: cell.position(),
    });
};
const code_points = (text) => Array.from(text, (character) => character.codePointAt(0) ?? 0);
/** Text by Unicode code point, no collation (LIB-9). */
const compare_texts = (a, b) => {
    const x = code_points(a);
    const y = code_points(b);
    const first_difference = x.findIndex((point, i) => point !== y[i]);
    return first_difference === -1
        ? x.length - y.length
        : (x[first_difference] ?? 0) - (y[first_difference] ?? Number.NEGATIVE_INFINITY);
};
/**
 * The value order of LIB-9, an interpreter rule the other adapters and the
 * UI follow: an absent value after any value, false before true, numbers by
 * value, text by code point. Ascending; a descending field reverses it.
 */
export const compare_values = (a, b) => a === undefined || a === null
    ? b === undefined || b === null
        ? 0
        : 1
    : b === undefined || b === null
        ? -1
        : typeof a === 'string' && typeof b === 'string'
            ? compare_texts(a, b)
            : typeof a === 'number' && typeof b === 'number'
                ? a - b
                : typeof a === 'boolean' && typeof b === 'boolean'
                    ? Number(a) - Number(b)
                    : 0;
/**
 * The comparison with a cursor, a page's (SC-22): a candidate after the
 * order key, the first field that differs deciding, a descending one
 * reversed, in the value order of LIB-9.
 */
export const after = (key) => (state) => (candidate) => (key
    .map(({ field, direction, value }) => (direction === 'ascending' ? 1 : -1) * compare_values(field(state)(candidate), value))
    .find((comparison) => comparison !== 0) ?? 0) > 0;
/**
 * The entries of a query on a state: the candidates of the source that the
 * selection keeps, in the order (the identity closes it), each as the entry
 * of its fields, and its actions' values, if any, as one more field (SC-33).
 */
const entries_on = (plan) => (state) => {
    const keeps = plan.selection(state);
    const order = plan.order.map(([field, direction]) => {
        const value = field(state);
        const sign = direction === 'ascending' ? 1 : -1;
        return (a, b) => sign * compare_values(value(a), value(b));
    });
    return plan
        .from(state)
        .filter(keeps)
        .toSorted((a, b) => order.reduce((result, by) => (result !== 0 ? result : by(a, b)), 0))
        .map((candidate) => {
        const read = Object.fromEntries(Object.entries(plan.fields).map(([name, field]) => [name, field(state)(candidate)]));
        const entry = plan.leaves === undefined
            ? read
            : {
                ...read,
                [plan.leaves.field]: plan.leaves.of(read).map((condition) => condition(state)),
            };
        return { identity: entry[plan.identity.field], entry };
    });
};
/** A read on one state: its entries and its position. */
export const read = (cell) => (plan) => Promise.resolve({
    entries: entries_on(plan)(cell.get()).map((identified) => identified.entry),
    position: cell.position(),
});
/** A page on one state (SC-22): the entries the page's selection keeps, at most `limit`; the total; the position. */
export const page = (cell) => (plan) => {
    const state = cell.get();
    return Promise.resolve({
        entries: entries_on({ ...plan, selection: plan.page })(state)
            .slice(0, plan.limit)
            .map((identified) => identified.entry),
        total: entries_on(plan)(state).length,
        position: cell.position(),
    });
};
/** Whether two values are the same, field by field and deeply (an interpreter rule, SC-19). */
const same_value = (a, b) => {
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return Object.is(a, b);
    }
    const other = new Map(Object.entries(b));
    return (Array.isArray(a) === Array.isArray(b) &&
        Object.keys(a).length === other.size &&
        Object.entries(a).every(([key, value]) => other.has(key) && same_value(value, other.get(key))));
};
/** Whether a fact is of the domain whose registry is given: a fact is of one domain (DOM-8). */
const is_of_the_domain = (registry) => (recorded) => recorded.fact.parts.some((part) => part.path in registry);
/**
 * The events of a fact for a query, the semantics of a stream (DOM-17, V10):
 * the entries before and after the fact, compared by identity and value. An
 * entry kept after it that the fact touches is the fact; one that stays
 * untouched and is no longer the same changed; one that appears untouched
 * entered; one that disappears left, touched or not. Interpreter rule: the
 * events of one fact come in the order of the entries after it, then those
 * that left, in their order before it.
 */
const events_of = (registry) => (plan) => (recorded) => {
    const before = entries_on(plan)(recorded.before);
    const after_it = entries_on(plan)(recorded.after);
    const before_it = (identity) => before.find((identified) => identified.identity === identity);
    const among_after = (identity) => after_it.some((identified) => identified.identity === identity);
    const touched = (identity) => is_of_the_domain(registry)(recorded) &&
        recorded.fact.parts.some((part) => part.resources.some((resource) => resource.path === plan.identity.path && resource.value === identity));
    const untouched = (identified) => {
        const was = before_it(identified.identity);
        const at = {
            position: recorded.position,
            identity: identified.identity,
            entry: identified.entry,
        };
        return was === undefined
            ? [{ event: 'entered', ...at }]
            : same_value(was.entry, identified.entry)
                ? []
                : [{ event: 'changed', ...at }];
    };
    return [
        ...after_it.flatMap((identified) => touched(identified.identity)
            ? [
                {
                    event: 'fact',
                    position: recorded.position,
                    identity: identified.identity,
                    fact: recorded.fact,
                    entry: identified.entry,
                },
            ]
            : untouched(identified)),
        ...before
            .filter(({ identity }) => !among_after(identity))
            .map(({ identity }) => ({ event: 'left', position: recorded.position, identity })),
    ];
};
/**
 * A stream from a position: the events of the facts kept from there, then
 * "caught up", then the events of each new fact; or "position no longer
 * available", when the cell keeps that position no longer (DOM-17).
 */
const stream = (cell) => (registry) => (plan) => (from) => {
    const events = events_of(registry)(plan);
    async function* live(position) {
        const given = await cell.after(position);
        yield* given.flatMap(events);
        yield* live(given.at(-1)?.position ?? position);
    }
    async function* from_history() {
        const history = cell.history(from);
        if (history.history === 'forgotten') {
            yield { event: 'position_unavailable' };
            return;
        }
        yield* history.recorded.flatMap(events);
        yield { event: 'caught_up', position: history.position };
        yield* live(history.position);
    }
    return from_history();
};
/**
 * The fact log of the cell (DOM-17): every fact of every domain of the node,
 * kept in one value; a consumer skips the paths it does not read. The facts
 * kept from a position, then "caught up", then each new one.
 */
export const log = (cell) => (from) => {
    const as_event = (fact) => ({
        event: 'fact',
        position: fact.position,
        fact: fact.fact,
    });
    async function* live(position) {
        const given = await cell.after(position);
        yield* given.map(as_event);
        yield* live(given.at(-1)?.position ?? position);
    }
    async function* from_history() {
        const history = cell.history(from);
        if (history.history === 'forgotten') {
            yield { event: 'position_unavailable' };
            return;
        }
        yield* history.recorded.map(as_event);
        yield { event: 'caught_up', position: history.position };
        yield* live(history.position);
    }
    return from_history();
};
/** The oracle streams a query natively: exact, the state before and after each fact of the cell. */
export const native = (cell) => (registry) => ({ strategy: 'native', stream: stream(cell)(registry) });
/** A query streamed by the library over the oracle's reads and its fact log (DOM-2), compared with the native stream (D69.3). */
export const composed = (cell) => ({ strategy: 'composed', log: log(cell) });

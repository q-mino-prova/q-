import { $Earlier, marked_as } from "./version.js";
import { $UseCase } from "./use_case.js";
// The builder's body (part 3.2). One builder over three forms (A, 16 Nov
// 2026 (7)): a fact or an effect of a past major, its payload with its step
// to the next; a command leaf, and a read leaf, over the next major's. Each
// form is a function of its own, whose type the compiler checks; the builder
// gives each `next` to its form by what `next` is, a component or a leaf,
// told apart at runtime (a leaf has a use case, a read leaf an entry): its
// overloads are the builder's type, which the compiler matches with each
// form only through that choice.
/** A fact or an effect of a past major: a copy of its payload, with the next major's component and the step to it. */
const earlier_component = (next) => (earlier) => Object.assign(earlier.payload.clone(), { [$Earlier]: { next, to_next: earlier.to_next } }, marked_as(next));
/** A command leaf of a past major: its own input and events, over the next major's leaf, with its declaration whole. */
const earlier_command_leaf = () => (next) => (earlier) => Object.assign({
    input: earlier.input,
    [$UseCase]: {
        use_case: next[$UseCase].use_case,
        events: earlier.events,
        declared: earlier,
    },
    [$Earlier]: { next },
}, marked_as(next));
/** A read leaf of a past major: its own input and entry, over the next major's leaf, with its declaration whole. */
const earlier_read_leaf = () => (next) => (earlier) => Object.assign({
    input: earlier.input,
    [$UseCase]: { use_case: next[$UseCase].use_case, entry: earlier.entry, declared: earlier },
    [$Earlier]: { next },
}, marked_as(next));
/** Whether a leaf of the next major is a read leaf: it has an entry, a command leaf events. */
const is_a_read_leaf = (leaf) => 'entry' in leaf[$UseCase];
export const earlier_builder = () => {
    function earlier(next) {
        if (!($UseCase in next))
            return earlier_component(next);
        return is_a_read_leaf(next)
            ? earlier_read_leaf()(next)
            : earlier_command_leaf()(next);
    }
    return earlier;
};

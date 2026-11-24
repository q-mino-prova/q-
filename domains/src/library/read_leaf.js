import { $UseCase } from "./use_case.js";
import { mark } from "./kind.js";
// The builder's body (part 3.2): a leaf is its input as declared, the use
// case it invokes, its entry, the actions it lists if it lists some, and its
// declaration whole.
export const read_use_case_over_builder = () => (leaf) => Object.assign({
    input: leaf.input,
    [$UseCase]: {
        use_case: leaf.use_case,
        entry: leaf.entry,
        declared: leaf,
        ...(leaf.actions === undefined ? {} : { actions: leaf.actions }),
    },
}, mark({ kind: 'usecase' }));

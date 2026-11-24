import { $UseCase } from "./use_case.js";
import { mark } from "./kind.js";
// The builder's body (part 3.2): a leaf is its input as declared, the use
// case it invokes, its events, the field that names its operation if it
// names one, and its declaration whole.
export const command_use_case_over_builder = () => (leaf) => Object.assign({
    input: leaf.input,
    [$UseCase]: {
        use_case: leaf.use_case,
        events: leaf.events,
        declared: leaf,
        ...(leaf.operation === undefined ? {} : { operation: leaf.operation.identity }),
    },
}, mark({ kind: 'usecase' }));

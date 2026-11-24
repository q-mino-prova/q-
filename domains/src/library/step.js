import { mark } from "./kind.js";
import { $Command } from "./command.js";
// The step of a process with a cursor (DOM-20, D97, D111, D112): a command for
// whoever invokes it, its path under `command/` (DOM-19). It reads the
// process by its key, chooses the next instance of the process's selection
// after its cursor, and applies to it the transition of another command,
// recording one fact with the step's part and the transition's (D111); or,
// none left, it closes the process. Only a process with a cursor needs it.
export const $Step = Symbol('Step');
// The builder's body (part 3.2): a step is its creator, with its input as
// declared and its parts, the facts it records among them; its branches as
// a command's are the types' alone.
export const cursor_step_builder = () => (step) => Object.assign((context) => step.creator(context), {
    input: step.input,
    [$Command]: {},
    [$Step]: {
        reads: step.reads,
        composes: step.composes,
        outcomes: step.outcomes,
        fields: step.fields,
        identity: step.identity,
        selection: step.selection,
        order: step.order,
    },
}, mark({ kind: 'command' }));

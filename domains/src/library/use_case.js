import { mark } from "./kind.js";
// Use cases (DOM-2, DOM-3, DOM-4): a domain's only entry. Personas, reactions
// and the effect executor reach a business domain through its use cases,
// never through its ports: its command is sent only by the domain, in its own
// store (DOM-8). A business use case does not know who asks (D85); what
// depends on the caller is the persona's.
export const $UseCase = Symbol('UseCase');
// The builders' bodies (part 3.2): a use case is the command or the query it
// is the port of, with the effect it returns from, the facts it names.
export const command_use_case_builder = () => (use_case) => ({
    [$UseCase]: {
        command: use_case.command,
        ...(use_case.returns_from === undefined ? {} : { returns_from: use_case.returns_from }),
    },
    ...mark({ kind: 'usecase' }),
});
export const read_use_case_builder = (use_case) => ({
    [$UseCase]: { query: use_case.query, facts: use_case.facts ?? [] },
    ...mark({ kind: 'usecase' }),
});

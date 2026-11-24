import { mark } from "./kind.js";
// Reactions (DOM-16, PER-12): "when fact E, command C", a standing order
// between two offices. Its module sits above the domains, which never import
// it (GR-9, D88.6): it speaks the language of the fact it reads and of the
// use case it invokes, and the configurator wires it. In Shed the folders
// under `reaction/` are procedures, the business occurrences that move more
// than one office (`retirement/`), the author's choice (A, 15 Nov 2026).
export const $Reaction = Symbol('Reaction');
/**
 * What a reaction's translation gives when its fact asks for no command
 * (D88.2): a value of the library, so that "no command" is never an input
 * of the invoked one. Not a builder: it builds no component.
 */
export const nothing = Symbol('nothing');
// The builder's body (part 3.2): a reaction is its fact and the use case it
// invokes, with its declaration whole.
export const reaction_builder = (reaction) => ({
    [$Reaction]: { when: reaction.when, invokes: reaction.invokes, declared: reaction },
    ...mark({ kind: 'reaction' }),
});

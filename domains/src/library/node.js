import { mark } from "./kind.js";
// Nodes (PER-6, PER-14): at most one in a folder, met by the library as it
// walks a path down, whatever the tree. A node is a function of the context,
// not of the request: it sees no input, since it sits above every leaf of
// its folder. It runs its lookups, its only I/O, then its perimeters, its
// limits and its bindings, pure, in the order of PER-5 (perimeter, then
// limit); it extends the context, never rewrites it (D105.2); once per
// request, for everything below it. It reads as sentences, its name the
// subject: `member` looks up …, is found only if …, is refused unless …,
// gives … (A, 13 Nov 2026).
export const $Node = Symbol('Node');
// The builder's body (part 3.2): a node holds its declaration whole, which
// the library runs as it walks a path down (steps 6 of the plan).
export const node_builder = () => (node) => Object.assign({ [$Node]: { declared: node } }, mark({ kind: 'node' }));

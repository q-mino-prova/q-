import { mark } from "./kind.js";
/**
 * The order of a query as written, closed by its identity, ascending (LIB-9,
 * D109), unless the author ordered by it already: so that the order is total.
 * A step's too, over the instances it walks (DOM-20).
 */
export const closed_order = (order, identity) => {
    const written = Object.entries(order).flatMap(([name, direction]) => direction === undefined ? [] : [[name, direction]]);
    return written.some(([name]) => name === identity)
        ? written
        : [...written, [identity, 'ascending']];
};
export const $Query = Symbol('Query');
// The builder's body (part 3.2): a query is its creator, with its input as
// declared and its parts.
export const query_builder = () => (query) => Object.assign((context) => query.creator(context), {
    input: query.input,
    [$Query]: {
        fields: query.fields,
        identity: query.identity,
        selection: query.selection,
        order: query.order,
        ...(query.calculations === undefined ? {} : { calculations: query.calculations }),
    },
}, mark({ kind: 'query' }));

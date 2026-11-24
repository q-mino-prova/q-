import { mark } from "./kind.js";
// Lookups (PER-9): a read of one key, which gives its value or "not known",
// with no list and no stream. A node runs its lookups, then its conditions
// and bindings, pure (PER-6). Whose lookups a node may run is the
// architecture's (auth's, D43, D77.3), not the library's (LIB-1). A lookup
// is implemented by an adapter: a token, a table, an identity provider (D43).
export const $Lookup = Symbol('Lookup');
// The builder's body (part 3.2): a lookup is its key and its value.
export const lookup_builder = (lookup) => ({
    [$Lookup]: { key: lookup.key, value: lookup.value },
    ...mark({ kind: 'lookup' }),
});

/**
 * What a plan writes for a choice (DOM-8, DOM-10): its parts' writes in
 * order, its fact in its envelope, under the request's operation, its
 * correlation and its fingerprint, the branch applied by name and the
 * branch each part it composed applied, and its entries, each with the
 * request's correlation (DOM-10).
 */
export const written = (context, name) => (chosen) => ({
    writes: chosen.parts.map((part) => part.write),
    fact: {
        parts: chosen.parts.map((part) => part.part),
        operation: context.operation,
        correlation: context.correlation,
        branch: name,
        composed: chosen.composed,
        fingerprint: context.fingerprint,
    },
    entries: chosen.parts.flatMap((part) => part.entries.map((entry) => ({ ...entry, correlation: context.correlation }))),
});
/** A part as an outcome gives it: its version, which never leaves the node (PER-18), left out. */
export const read_fields = (part) => ({
    path: part.path,
    payload: part.payload,
    resources: part.resources,
});

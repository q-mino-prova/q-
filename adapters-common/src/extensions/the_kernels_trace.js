import * as boundary from '@q-mino/boundary';
/**
 * The routing of a request by what it invokes (EXT-6, F8), before the gate
 * and before any check that answers: one to the kernel goes to its persona;
 * one to an extension goes on only if the extension is installed (the
 * composition's), active, and offered to the bond of the `Caller`'s key
 * (what auth's lookup tells, `the_extensions_offered_to_the_bond_of_a_key`:
 * none for an `anonymous` letter); else silence, in that order of cases.
 */
export const route = (given) => {
    if (given.invokes.of === 'the_kernel')
        return { routed: 'to_the_kernel' };
    const extension = given.invokes.extension;
    if (!given.installed.includes(extension)) {
        return { routed: 'to_silence', why: 'the_extension_is_not_installed' };
    }
    if (!given.active.includes(extension)) {
        return { routed: 'to_silence', why: 'the_extension_is_not_active' };
    }
    if (!given.offered_to_the_bond_of_the_caller.includes(extension)) {
        return { routed: 'to_silence', why: 'the_extension_is_not_offered_to_the_bond' };
    }
    return { routed: 'to_an_extension', extension };
};
/** A value's JSON text; nothing for `undefined` or a function, which `JSON.stringify`'s type does not tell. */
const stringified = (value) => JSON.stringify(value);
/** A value as the trace keeps it: JSON as `JSON.stringify` writes it (a field `undefined` left out), or its text where it is none. */
export const as_traced = (value) => {
    try {
        const written = boundary.json.safeParse(JSON.parse(stringified(value) ?? 'null'));
        return written.success ? written.data : String(value);
    }
    catch {
        return String(value);
    }
};

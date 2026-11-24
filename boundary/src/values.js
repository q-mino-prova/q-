import * as z from 'zod';
/** A JSON value: no `undefined`, no function, no date, no `NaN` nor infinity (EXT-2: a frame passes it as it is, EXT-13). */
export const json = z.json();
/** A JSON object: a context, an event's fields. */
export const json_object = z.record(z.string(), json);
/** A version, semver: major, minor, patch (a surface's, an extension's, the boundary's: EXT-5, EXT-9, EXT-10). */
export const semver = z.templateLiteral([z.number(), '.', z.number(), '.', z.number()]);
/** A business name in snake_case (EXT-3): an extension's, an extension point's, an event's. */
export const a_name = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);
/**
 * A leaf, by its path in its surface from the persona's segment (EXT-5,
 * DOM-24): a path whose folders hold a `usecase/` segment
 * (`usecase/greet_a_bond`).
 */
export const a_leaf = z.string().regex(/^(?:[a-z0-9_]+\/)*usecase\/[a-z][a-z0-9_]*$/);
/** A file of an extension's bundle, by its path from the package's root (`frame/the_greetings_of_a_bond.html`, EXT-16). */
export const a_file = z.string().regex(/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.[a-z0-9]+$/);
/** A list of names from a closed set, each named once (EXT-10: `touches`, `sees`). */
export const a_set_of = (names) => z
    .array(names)
    .readonly()
    .refine((listed) => new Set(listed).size === listed.length, 'a name listed twice');

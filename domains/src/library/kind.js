import * as z from 'zod';
/**
 * What a builder tells of what it built: its kind; for a selection predicate
 * and a calculation, the subject it declares, which the generator writes
 * after the kind (DOM-18); for a condition composed with AND, OR, NOT, that it
 * is one, its kind the file's.
 */
export const built = z.union([
    z.strictObject({
        kind: z.enum([
            'id',
            'fact',
            'predicate',
            'effect',
            'command',
            'query',
            'usecase',
            'lookup',
            'node',
            'reaction',
            'version',
        ]),
    }),
    z.strictObject({ kind: z.enum(['selection', 'calculation']), subject: z.string().min(1) }),
    z.strictObject({ kind: z.literal('condition') }),
]);
export const $Built = Symbol('Built');
/** The mark of a kind, for a builder to leave. */
export const mark = (kind) => ({ [$Built]: kind });
/**
 * What built a value, if a builder of the library did: its kind, and its
 * subject for a selection predicate or a calculation; nothing for any other
 * value, a zod schema (a value of the domain, DOM-21) or a function of `dsl`.
 * A component of a past major tells the kind of the next major's it stands
 * for (`earlier`, `delegate`).
 */
export const kind_of = (value) => (typeof value === 'object' || typeof value === 'function') && value !== null && $Built in value
    ? built.parse(value[$Built])
    : undefined;
/**
 * Whether a value is a zod schema: an exported one with no mark is a value of
 * its domain (DOM-21), and an input declared inline is a schema or a function
 * of the context that gives one (DOM-21). For the generator, which reads what
 * the authored files export.
 */
export const is_a_schema = (value) => value instanceof z.ZodType;

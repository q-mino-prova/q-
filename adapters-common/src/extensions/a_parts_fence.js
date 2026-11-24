import * as boundary from '@q-mino/boundary';
import { as_traced } from "./the_kernels_trace.js";
/**
 * A part's message through the fence (EXT-4): one that is no message of a
 * part's, a part of an extension not active, or a part not shown,
 * refused and traced (`a_part_fenced`); else served, on its own
 * extension's surface on `self`, whose gate and leaf the library's mounted
 * port checks as for any invocation (`not_a_leaf`, PER-5).
 */
export const through_a_parts_fence = (given) => {
    const refused = (fence) => ({
        fenced: 'refused',
        traced: {
            why: 'a_part_fenced',
            extension: given.part.extension,
            now: given.now,
            fence,
            message: as_traced(given.message),
        },
    });
    const parsed = boundary.a_message_from_a_part.safeParse(given.message);
    if (!parsed.success)
        return refused('not_a_parts_message');
    if (!given.active)
        return refused('the_extension_is_not_active');
    if (!given.part.shown)
        return refused('the_part_is_not_shown');
    const message = parsed.data;
    return {
        fenced: 'served',
        exchange: message.message,
        id: message.id,
        invokes: {
            of: 'an_extension',
            extension: given.part.extension,
            persona: 'self',
            use_case: message.use_case,
            version: message.version,
        },
        input: message.input,
    };
};

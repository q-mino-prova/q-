// generated
// The point of `persona/self`, mounted below a node of another tree (EXT-11):
// the context that node gives here, the root's alone (PER-6, "A mounted
// folder"). The one module of the tree that gives it; the scopes below read the
// context from here, and no node takes it again (D105.2).
import * as z from 'zod';
/** The folder `persona/self`, mounted: the context given to everything below it, from outside (EXT-11). */
export const self = {
    mounted: 'persona/self',
    context: z.strictObject({}),
};

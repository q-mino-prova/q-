import { name } from "./version.js";
/**
 * The mounted folders of an extension's tree with their contexts, from its
 * declaration (EXT-11): on `known` the bond, and what `sees.known` lists; on
 * `self` the root's alone (one face, PER-3).
 */
export const mounted_of = (declaration) => ({
    'persona/known': { from: name, context: ['the_bond', ...(declaration.sees?.known ?? [])] },
    'persona/self': { from: name, context: [] },
});

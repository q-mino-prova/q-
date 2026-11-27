import * as boundary from '@q-mino/boundary';
/** The path a point names (`shows`), from a manifest as data: a slot's or a page's by its name; none for a manifest that does not parse, which its composition tells. */
const the_module_of = (manifest, point) => {
    const parsed = boundary.the_manifest.safeParse(manifest);
    if (!parsed.success)
        return undefined;
    const points = point.point === 'slot' ? parsed.data.slots : parsed.data.pages;
    return Object.hasOwn(points, point.name) ? points[point.name]?.shows : undefined;
};
/** The name a manifest gives its extension, none for one that does not parse. */
const the_name_of = (manifest) => {
    const parsed = boundary.the_manifest.safeParse(manifest);
    return parsed.success ? parsed.data.name : undefined;
};
/**
 * The parts the screens draw (`ThePartsOfTheApp`), from the extensions the
 * app carries: a point's part carried when its extension's manifest names a
 * module there and the app carries that module; else not carried, the
 * app's fault (WEB-23).
 */
export const the_parts_carried = (extensions) => (extension, point) => {
    const carried = extensions.find((each) => the_name_of(each.manifest) === extension);
    const shows = carried === undefined ? undefined : the_module_of(carried.manifest, point);
    const imports = shows === undefined || carried?.parts === undefined || !Object.hasOwn(carried.parts, shows)
        ? undefined
        : carried.parts[shows];
    return imports === undefined
        ? { part: 'not_carried' }
        : { part: 'carried', imports: async () => (await imports()).part };
};

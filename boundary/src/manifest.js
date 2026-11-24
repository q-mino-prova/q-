import * as z from 'zod';
import { seen_on_known } from "./contexts.js";
import { place } from "./places.js";
import { port } from "./ports.js";
import { a_base_event, the_kernels_events_on_known } from "./the_kernels_node.js";
import { a_file, a_leaf, a_name, a_set_of, json, semver } from "./values.js";
import { version } from "./version.js";
// The manifest (EXT-3, EXT-10): what an extension is to the kernel. Its
// declaration is authored, `manifest.ts` in the extension's package, with
// `manifest(...)`: the name, what it sees, what it touches, its extension
// points, what the user accepts; its leaves typed by the paths of `self`'s
// registry (`Manifest<typeof registry>`). Its surface is its tree's, which
// the extension's build derives; the build writes the manifest as data
// (`manifest.json`, `the_manifest`), the one form the kernel reads, with
// the package's version and the boundary's, never written by hand.
/** An action (EXT-16): data the kernel draws in a place, which invokes a leaf of the extension on `self` with the place's data. */
const an_action = z.strictObject({ on: place, invokes: a_leaf });
/** A slot (EXT-16): a part the kernel places in a screen of its own, with a document of the extension's bundle. */
const a_slot = z.strictObject({ on: place, shows: a_file });
/** A page (EXT-16): a part the kernel places as a screen, from the extension's own screen. */
const a_page = z.strictObject({ on: z.literal('the_extension'), shows: a_file });
/** The declaration's schema (EXT-10): a name in snake_case, names from the boundary's closed sets each listed once, a leaf's path, a file's. */
export const the_declaration = z.strictObject({
    name: a_name,
    sees: z.strictObject({ known: a_set_of(seen_on_known).optional() }).optional(),
    touches: a_set_of(port),
    actions: z.record(a_name, an_action).optional(),
    slots: z.record(a_name, a_slot).optional(),
    pages: z.record(a_name, a_page).optional(),
});
/**
 * The declaration of an extension (EXT-10), as data: its literal types
 * kept, so that its configurator's ports (`PortsOf`) and its tree's
 * mounted points (`mounted_of`) are typed from it. Checked by its schema
 * when its module loads (the generator's configuration loads it at `pnpm
 * generate`); `invokes` is checked by type when the declaration `satisfies`
 * `Manifest<typeof registry>`, `self`'s registry imported as a type.
 */
export const manifest = (declaration) => {
    the_declaration.parse(declaration);
    return declaration;
};
/** A major, as a key of a surface's majors (`"1"`). */
const a_major = z.string().regex(/^(?:0|[1-9][0-9]*)$/);
/**
 * A leaf of a surface at a major (EXT-10, EXT-6): whether it takes an
 * operation (a command) or none (a read), its input's JSON Schema, its
 * events by name, each the JSON Schema of the whole event, and whether it
 * answers in one event (F7: every leaf on `known` does, EXT-4).
 */
const a_leaf_of_a_surface = z.strictObject({
    kind: z.enum(['command', 'read']),
    input: json,
    events: z.record(a_name, json),
    answers_in_one_event: z.boolean(),
});
/**
 * The surface an extension adds to a persona (EXT-5, EXT-10, PER-17): the
 * version it speaks and its leaves at each major of its window, by their
 * paths; the majors hold the version's.
 */
export const a_surface = z
    .strictObject({
    version: semver,
    majors: z.record(a_major, z.record(a_leaf, a_leaf_of_a_surface)),
})
    .refine((surface) => Object.hasOwn(surface.majors, surface.version.split('.')[0] ?? ''), {
    message: 'the majors do not hold the version’s',
});
/** A schema of the boundary's as a surface carries it (EXT-10): its JSON Schema, on the input side, with no `$schema`. */
const json_schema_of = (schema) => json.parse(Object.fromEntries(Object.entries(z.toJSONSchema(schema, { io: 'input' })).filter(([key]) => key !== '$schema')));
/** The events the kernel's node and entry give above an extension's leaves on each persona (EXT-5): on `known` its closing and the base events, on `self` the base events. */
const the_kernels_events = {
    known: the_kernels_events_on_known.options,
    self: a_base_event.options,
};
/**
 * A surface as an extension's tree gives it (its leaves' own events, and the
 * closings of its nodes and limits), below the kernel's node at the top of a
 * persona (EXT-5, EXT-10): each leaf's events with those the kernel gives
 * above it, as the boundary types them, whole, by name; a read leaf takes
 * no operation, so no `identity_already_used`. So the surface the manifest
 * carries types every event a peer's response may hold (EXT-12), and the
 * kernel parses what the extension gives by it (EXT-15).
 */
export const below_the_kernels_node = (persona) => (surface) => ({
    version: surface.version,
    majors: Object.fromEntries(Object.entries(surface.majors).map(([major, leaves]) => [
        major,
        Object.fromEntries(Object.entries(leaves).map(([path, leaf]) => [
            path,
            {
                ...leaf,
                events: {
                    ...leaf.events,
                    ...Object.fromEntries(the_kernels_events[persona]
                        .filter((event) => leaf.kind === 'command' ||
                        event.shape.event.value !== 'identity_already_used')
                        .map((event) => [event.shape.event.value, json_schema_of(event)])),
                },
            },
        ])),
    ])),
});
/**
 * The manifest as data (EXT-10), `manifest.json`, the one form the kernel
 * reads: the declaration, every list and record present (maybe empty), the
 * extension's version and the boundary's, and its surfaces per persona (none
 * where it adds no leaf).
 */
export const the_manifest = z.strictObject({
    name: a_name,
    version: semver,
    boundary_version: semver,
    sees: z.strictObject({ known: a_set_of(seen_on_known) }),
    touches: a_set_of(port),
    actions: z.record(a_name, an_action),
    slots: z.record(a_name, a_slot),
    pages: z.record(a_name, a_page),
    surfaces: z.strictObject({ self: a_surface.optional(), known: a_surface.optional() }),
});
/**
 * The manifest as data, from the declaration, the package's version and the
 * surfaces its build derives (EXT-10): the one place it is made. The
 * boundary version is the boundary's the extension is built with
 * (`version`), never given.
 */
export const the_manifest_as_data = (made) => the_manifest.parse({
    name: made.declaration.name,
    version: made.version,
    boundary_version: version,
    sees: { known: made.declaration.sees?.known ?? [] },
    touches: made.declaration.touches,
    actions: made.declaration.actions ?? {},
    slots: made.declaration.slots ?? {},
    pages: made.declaration.pages ?? {},
    surfaces: made.surfaces,
});

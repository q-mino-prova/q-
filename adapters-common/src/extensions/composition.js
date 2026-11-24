import * as boundary from '@q-mino/boundary';
import * as z from 'zod';
/** What this kernel offers in stage 1, beside the names installed: its boundary's major, both ports (EXT-2). */
export const the_kernels_offer = (installed) => ({
    boundary_majors: [major_of(boundary.version)],
    ports: boundary.port.options,
    installed,
});
/** A version's major. */
const major_of = (version) => Number(version.split('.')[0]);
/** A fault told as a sentence, with its rule. */
const told = (fault) => {
    switch (fault.fault) {
        case 'the_manifest_does_not_parse':
            return `its manifest does not parse: ${fault.issues.join('; ')} (EXT-10)`;
        case 'a_boundary_major_not_spoken':
            return `built with the boundary ${fault.boundary_version}, a major the kernel does not speak (${fault.spoken.join(', ')}) (EXT-9, EXT-4)`;
        case 'a_name_not_unique':
            return 'an extension of this name is installed already (EXT-3)';
        case 'a_port_not_offered':
            return `it touches ${fault.port}, a port the kernel does not offer extensions (EXT-4)`;
        case 'a_leaf_on_known_that_does_not_answer_in_one_event':
            return `its leaf ${fault.leaf} on known, at major ${String(fault.major)}, does not answer in one event (F7, EXT-4)`;
        case 'an_input_on_known_the_kernel_cannot_check':
            return `the input of its leaf ${fault.leaf} on known, at major ${String(fault.major)}, holds a shape its JSON Schema does not tell whole (a refinement, a form with no JSON word, a form its reading loses), at ${fault.marks.join(', ')} (EXT-6, EXT-4)`;
        case 'a_surface_with_no_leaves_at_its_version':
            return `its surface on ${fault.persona} speaks ${fault.version}, a major with no leaves (PER-17, EXT-4)`;
        case 'a_json_schema_not_read':
            return `the ${fault.schema} of its leaf ${fault.leaf} on ${fault.persona}, at major ${String(fault.major)}, is a JSON Schema the kernel cannot read: ${fault.error} (EXT-6)`;
        case 'an_action_on_no_leaf_of_self':
            return `its action ${fault.action} invokes ${fault.invokes}, no leaf of self at its version (EXT-10, EXT-4)`;
        case 'a_ready_that_differs':
            return `it said ready as ${fault.ready.name} ${fault.ready.version} with the boundary ${fault.ready.boundary_version}, not as its manifest (EXT-15)`;
    }
};
/** Every fault of an extension, in one message (CFG-2): one line each. */
export const a_composition_fault = (name, faults) => ({
    composition: 'a_fault',
    name,
    faults,
    message: faults.map((fault) => `${name}: ${told(fault)}`).join('\n'),
});
/** Whether a value is a JSON object. */
const is_an_object = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
/**
 * The places in a JSON Schema where the export marked what JSON Schema
 * cannot tell (`json_schema_of`, DOM-21: `x-refined`, `x-unrepresentable`)
 * or what zod's reading of it loses (`x-lossy`, EXT-6), as JSON Pointers
 * (`/properties/words`).
 */
export const the_marks_in = (schema, at = '') => {
    if (Array.isArray(schema)) {
        return schema.flatMap((item, index) => the_marks_in(item, `${at}/${String(index)}`));
    }
    if (!is_an_object(schema))
        return [];
    const here = Object.hasOwn(schema, 'x-refined') ||
        Object.hasOwn(schema, 'x-unrepresentable') ||
        Object.hasOwn(schema, 'x-lossy')
        ? [at === '' ? '/' : at]
        : [];
    return [
        ...here,
        ...Object.entries(schema).flatMap(([key, value]) => the_marks_in(value, `${at}/${key}`)),
    ];
};
/** What zod's `fromJSONSchema` takes: a JSON Schema, an object or a boolean; it throws on one it cannot read. */
const is_a_json_schema = (value) => typeof value === 'boolean' ||
    (typeof value === 'object' && value !== null && !Array.isArray(value));
/** A JSON Schema read into a schema by zod (EXT-6), or why not. */
const read = (schema) => {
    if (!is_a_json_schema(schema))
        return { read: 'not_read', error: 'no JSON Schema' };
    try {
        return { read: 'read', schema: z.fromJSONSchema(schema) };
    }
    catch (error) {
        return { read: 'not_read', error: error instanceof Error ? error.message : String(error) };
    }
};
/** A surface of the manifest's, read into the surface its leaves are mounted with, and the faults found reading it. */
const a_mounted_surface = (persona, surface) => {
    const faults = [];
    const majors = Object.entries(surface.majors).map(([key, leaves]) => {
        const major = Number(key);
        const read_leaves = Object.entries(leaves).map(([leaf, given]) => {
            const not_read = (name, error) => {
                faults.push({ fault: 'a_json_schema_not_read', persona, major, leaf, schema: name, error });
            };
            if (persona === 'known' && !given.answers_in_one_event) {
                faults.push({ fault: 'a_leaf_on_known_that_does_not_answer_in_one_event', major, leaf });
            }
            const marks = persona === 'known' ? the_marks_in(given.input) : [];
            if (marks.length > 0) {
                faults.push({ fault: 'an_input_on_known_the_kernel_cannot_check', major, leaf, marks });
            }
            const input = read(given.input);
            if (input.read === 'not_read')
                not_read('input', input.error);
            const events = Object.entries(given.events).flatMap(([name, event]) => {
                const read_event = read(event);
                if (read_event.read === 'read')
                    return [[name, read_event.schema]];
                not_read(`event ${name}`, read_event.error);
                return [];
            });
            return [
                leaf,
                {
                    kind: given.kind,
                    input: input.read === 'read' ? input.schema : z.never(),
                    events: Object.fromEntries(events),
                },
            ];
        });
        return [major, Object.fromEntries(read_leaves)];
    });
    const at_its_version = surface.majors[String(major_of(surface.version))] ?? {};
    if (Object.keys(at_its_version).length === 0) {
        faults.push({
            fault: 'a_surface_with_no_leaves_at_its_version',
            persona,
            version: surface.version,
        });
    }
    return {
        surface: { version: surface.version, majors: Object.fromEntries(majors) },
        faults,
    };
};
/**
 * An extension composed with what the kernel offers (EXT-4, CFG-2): its
 * manifest parsed by the boundary's schema; its boundary major one the
 * kernel speaks; its name not installed already; its ports offered; its
 * surfaces read (each JSON Schema by zod, every leaf on `known` answering in
 * one event and with no refinement in its input); its actions on leaves of
 * `self`. Composed, or every fault in one message.
 */
export const compose_an_extension = (offer) => (manifest_as_data) => {
    const parsed = boundary.the_manifest.safeParse(manifest_as_data);
    if (!parsed.success) {
        const named = typeof manifest_as_data === 'object' && manifest_as_data !== null
            ? Reflect.get(manifest_as_data, 'name')
            : undefined;
        return a_composition_fault(typeof named === 'string' ? named : 'an extension', [
            {
                fault: 'the_manifest_does_not_parse',
                issues: parsed.error.issues.map((issue) => `${issue.path.map(String).join('.')}: ${issue.message}`),
            },
        ]);
    }
    const manifest = parsed.data;
    const self = manifest.surfaces.self && a_mounted_surface('self', manifest.surfaces.self);
    const known = manifest.surfaces.known && a_mounted_surface('known', manifest.surfaces.known);
    const leaves_of_self = manifest.surfaces.self?.majors[String(major_of(manifest.surfaces.self.version))] ?? {};
    const faults = [
        ...(offer.boundary_majors.includes(major_of(manifest.boundary_version))
            ? []
            : [
                {
                    fault: 'a_boundary_major_not_spoken',
                    boundary_version: manifest.boundary_version,
                    spoken: offer.boundary_majors,
                },
            ]),
        ...(offer.installed.includes(manifest.name) ? [{ fault: 'a_name_not_unique' }] : []),
        ...manifest.touches
            .filter((port) => !offer.ports.includes(port))
            .map((port) => ({ fault: 'a_port_not_offered', port })),
        ...(self?.faults ?? []),
        ...(known?.faults ?? []),
        ...Object.entries(manifest.actions)
            .filter(([, action]) => !Object.hasOwn(leaves_of_self, action.invokes))
            .map(([action, { invokes }]) => ({ fault: 'an_action_on_no_leaf_of_self', action, invokes })),
    ];
    if (faults.length > 0)
        return a_composition_fault(manifest.name, faults);
    return {
        composition: 'composed',
        composed: {
            manifest,
            surfaces: {
                ...(self === undefined ? {} : { self: self.surface }),
                ...(known === undefined ? {} : { known: known.surface }),
            },
        },
    };
};

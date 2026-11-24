import * as z from 'zod';
import { cursor, position, semver } from "./format.js";
import { json_schema_of } from "./json_schema.js";
import { is_a_schema } from "./kind.js";
import { $Node } from "./node.js";
import { is_a_record } from "./runtime.js";
import { $UseCase } from "./use_case.js";
import { $Delegated, $Earlier, $Version } from "./version.js";
/** A component's part under a symbol, as a record; none if it has none. */
const part_of = (component, symbol) => {
    const part = is_a_record(component) ? Reflect.get(component, symbol) : undefined;
    return is_a_record(part) ? part : {};
};
/** What a component holds under a symbol, as it is (a version's text). */
const part_of_symbol = (component, symbol) => is_a_record(component) ? Reflect.get(component, symbol) : undefined;
/** A component's declaration whole, under a symbol, as a record (`declared`); none if it has none. */
const declared_of = (component, symbol) => {
    const declared = part_of(component, symbol)['declared'];
    return is_a_record(declared) ? declared : {};
};
/** The names of a record of conditions (perimeters, limits, lookups). */
const names_in = (conditions) => is_a_record(conditions) ? Object.keys(conditions) : [];
/** A leaf of a past major delegated to the next major's: the one it delegates to, step by step (PER-17). */
const resolved = (component, left) => left > 0 && is_a_record(component) && $Delegated in component
    ? resolved(Reflect.get(component, $Delegated), left - 1)
    : component;
/** The current leaf a past major's leaf leads to (PER-17): its flow, its limits and its stream are the current leaf's. */
const current_of = (component, left) => {
    const leaf = resolved(component, left);
    if (left === 0 || !is_a_record(leaf) || !($Earlier in leaf))
        return leaf;
    const over = part_of(leaf, $Earlier);
    return current_of(over['next'], left - 1);
};
/** The whole event a leaf's own event is, `{ event, payload }` (D72.3). */
const own_event = (name, payload) => z.strictObject({ event: z.literal(name), payload });
/** The closings of the nodes between the folder and a leaf, and of the leaf's limits (PER-14): `not_found` if any looks up or has perimeters, `refused` with every limit's name. */
const closings_of = (registry, path, current) => {
    const nodes = Object.entries(registry).flatMap(([node_path, node]) => {
        const folder = node_path.split('/node/')[0] ?? node_path;
        return is_a_record(node) && $Node in node && path.startsWith(`${folder}/`)
            ? [declared_of(node, $Node)]
            : [];
    });
    const finds = nodes.some((declared) => names_in(declared['looks_up']).length > 0 ||
        names_in(declared['is_found_only_if']).length > 0);
    const reasons = [...nodes, declared_of(current, $UseCase)].flatMap((declared) => names_in(declared['is_refused_unless']));
    const [first, ...rest] = reasons;
    return {
        ...(finds ? { not_found: z.strictObject({ event: z.literal('not_found') }) } : {}),
        ...(first === undefined
            ? {}
            : {
                refused: z.strictObject({
                    event: z.literal('refused'),
                    reasons: z.array(z.enum([first, ...rest])),
                }),
            }),
    };
};
/** The JSON Schema of a leaf's input: its schema's, or a mark for a function of the context, which the export cannot tell (DOM-21). */
const input_of = (leaf) => {
    const input = is_a_record(leaf) ? leaf['input'] : undefined;
    return is_a_schema(input)
        ? json_schema_of(input)
        : { 'x-unrepresentable': 'function of the context' };
};
/** A leaf of the surface, from the component at its path in a major's registry and the current leaf it leads to; none for a component that is no leaf. */
const leaf_of = (registry, path, component, left) => {
    const leaf = resolved(component, left);
    const own = part_of(leaf, $UseCase);
    const current = current_of(component, left);
    const declared = declared_of(current, $UseCase);
    const closings = closings_of(registry, path, current);
    const as_json = (events) => Object.fromEntries(Object.entries(events).map(([name, schema]) => [name, json_schema_of(schema)]));
    const events = own['events'];
    if (is_a_record(events) && 'use_case' in own) {
        const follows = declared['follows'] !== undefined;
        return {
            kind: 'command',
            input: input_of(leaf),
            events: as_json({
                ...Object.fromEntries(Object.entries(events).flatMap(([name, payload]) => is_a_schema(payload) ? [[name, own_event(name, payload)]] : [])),
                ...(follows
                    ? {
                        the_wait_is_over: z.strictObject({
                            event: z.literal('the_wait_is_over'),
                            position,
                        }),
                    }
                    : {}),
                ...closings,
            }),
            answers_in_one_event: !follows,
        };
    }
    const entry = own['entry'];
    if (!(entry instanceof z.ZodObject))
        return undefined;
    if (declared['stream'] !== undefined || declared['actions'] !== undefined) {
        throw new Error(`${path}: a read leaf that streams or lists actions has its surface with its case (EXT-10)`);
    }
    return {
        kind: 'read',
        input: input_of(leaf),
        events: as_json({
            snapshot: z.strictObject({
                event: z.literal('snapshot'),
                entries: z.array(entry),
                position,
                total: z.number().int().min(0),
                next: cursor.optional(),
            }),
            ...closings,
        }),
        answers_in_one_event: true,
    };
};
/**
 * The surface of the leaves below a folder (EXT-10, PER-17): the version
 * the majors declare (one current registry, whose `version.ts` declares it
 * under its major), and at each major its leaves by their path from the
 * folder, a past major's leaf as its own input and events give it, its flow
 * and limits the current leaf's it leads to. Faults, thrown: majors that do
 * not declare one version under its major; a leaf not below the folder; a
 * read leaf that streams or lists actions (its surface comes with its case).
 */
export const the_surface_of = (surface) => {
    const declared = Object.entries(surface.majors).flatMap(([major, registry]) => Object.values(registry).flatMap((entry) => {
        const version = semver.safeParse(part_of_symbol(entry, $Version));
        return version.success ? [{ major, version: version.data }] : [];
    }));
    const [current] = declared;
    if (current === undefined ||
        declared.length > 1 ||
        !current.version.startsWith(`${current.major}.`)) {
        throw new Error(`the majors of ${surface.at} do not declare one version under its major (PER-17, EXT-10)`);
    }
    const window = Object.keys(surface.majors).length;
    return {
        version: current.version,
        majors: Object.fromEntries(Object.entries(surface.majors).map(([major, registry]) => [
            major,
            Object.fromEntries(Object.entries(registry).flatMap(([path, component]) => {
                const leaf = leaf_of(registry, path, component, window);
                if (leaf === undefined)
                    return [];
                if (!path.startsWith(`${surface.at}/`)) {
                    throw new Error(`${path} is not below ${surface.at} (EXT-10)`);
                }
                return [[path.slice(surface.at.length + 1), leaf]];
            })),
        ])),
    };
};

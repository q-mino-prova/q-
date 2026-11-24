import * as z from 'zod';
import { $Calculation } from "./component.js";
import { $Query, closed_order } from "./query.js";
import { cursor_of, key_of } from "./stable.js";
import { $UseCase } from "./use_case.js";
import { $Versions } from "./registry.js";
import { is_a_schema, kind_of } from "./kind.js";
import { bind, fold } from "./bound_condition.js";
import { called, is_a_record, paths_in, serving } from "./runtime.js";
import { actions_of, planned_actions } from "./actions.js";
import { stream_after, stream_from, } from "./read_stream.js";
/**
 * A page as asked (`Page`, SC-22): its size a whole number, at least 1, as
 * the leaf's schema bounds it, else a fault of whoever binds it, thrown;
 * its cursor whatever the client sent back, which decodes to the query's
 * order key or is `cursor_not_in_schema`. Strict, as every signature
 * (DOM-21).
 */
const page_asked = z.strictObject({
    size: z.number().int().min(1).optional(),
    after: z.unknown().optional(),
});
/**
 * The field under which the adapter writes the values of the actions' leaves
 * on an entry (`PlannedLeaves.field`, SC-33): the library's name, which no
 * field of a query can have (DOM-25: a name is snake_case).
 */
const action_leaves = '@leaves';
export function read_use_case_ports(ports) {
    return runtime_ports(ports);
}
/** A query's parts, read from its builder's value (part 3.2). */
const query_parts = (path_of) => (query) => {
    const parts = query[$Query];
    const calculations = Object.entries(parts.calculations ?? {}).map(([name, calculation]) => {
        const path = path_of(calculation);
        return path === undefined
            ? `the calculation ${name} is not in the registry given (DOM-24)`
            : { name, parameters: calculation, path, value: calculation[$Calculation].value };
    });
    const fault = calculations.find((calculation) => typeof calculation === 'string');
    if (fault !== undefined)
        return fault;
    return {
        creator: query,
        input: 'input' in query ? query.input : undefined,
        fields: parts.fields,
        identity: parts.identity,
        selection: parts.selection,
        order: closed_order(parts.order, parts.identity),
        calculations: calculations.filter((calculation) => typeof calculation !== 'string'),
    };
};
/** The body of `read_use_case_ports`, typed by what it meets at runtime. */
const runtime_ports = (ports) => {
    const path_of = paths_in(ports.registry);
    const identity_path_of = paths_in({ ...ports.identities, ...ports.registry });
    const binding = bind(path_of);
    const parts_of = query_parts(path_of);
    const actions_in = actions_of(ports.registry, path_of);
    // At wiring (CFG-2), every fault in one message: a use case not in the
    // registry; a calculation not in it; an entry's identity that no registry
    // given names, which a stream's touch reads by its path (DOM-17); a fact
    // the use case names that is not its domain's, which its stream would not
    // carry (DOM-17).
    const queries = Object.entries(ports.use_cases).map(([name, use_case]) => {
        const path = path_of(use_case);
        if (path === undefined)
            return { name, fault: `the use case ${name} is not in the registry given (DOM-24)` };
        const query = parts_of(use_case[$UseCase].query);
        if (typeof query === 'string')
            return { name, fault: `${path}: ${query}` };
        const identity = identity_path_of(query.fields.shape[query.identity]);
        if (identity === undefined) {
            return {
                name,
                fault: `${path}: its identity ${query.identity} is an identity that no registry given names: give the registry of its domain (identities, DOM-24)`,
            };
        }
        if (use_case[$UseCase].facts.some((fact) => path_of(fact) === undefined)) {
            return {
                name,
                fault: `${path}: it names a fact that is not its domain's, which its stream does not carry (DOM-17)`,
            };
        }
        return { name, path, query, identity };
    });
    const faults = queries.flatMap((each) => ('fault' in each ? [each.fault] : []));
    if (faults.length > 0)
        throw new Error(faults.join('\n'));
    return (adapter) => {
        const fragment_of = (leaf) => {
            const fragment = adapter.algebra.predicate[leaf.path];
            if (fragment === undefined)
                throw new Error(`the adapter gives no fragment of ${leaf.path} (ADP-8)`);
            return fragment(leaf.parameters);
        };
        const folded = fold({
            leaf: fragment_of,
            and: adapter.algebra.and,
            or: adapter.algebra.or,
            not: adapter.algebra.not,
        });
        /**
         * Whether a fact as stored is of the ports' domain (DOM-8, D64.3): a fact
         * is of one domain, so any of its parts tells, by its path in the
         * domain's registry, the same in every major (DOM-24).
         */
        const of_the_domain = (fact) => fact.parts.some((part) => part.path in ports.registry);
        /**
         * A fact of the domain as stored, as a stream carries it (DOM-17): its
         * parts at the current shape, each by its path and version, at the one
         * place (DOM-22), which stops on a version it does not know; its
         * operation and correlation. What the duplicate branch reads (the branch,
         * the fingerprint) stays in the store (PER-18).
         */
        const envelope_of = (fact) => ({
            parts: fact.parts.map((part) => {
                if (!(part.path in ports.registry)) {
                    throw new Error(`a fact of the domain holds a part of another, ${part.path}: one fact, one domain (DOM-8)`);
                }
                return ports.versions[$Versions].part(part);
            }),
            operation: fact.operation,
            correlation: fact.correlation,
        });
        /**
         * A query's wiring over the adapter (CFG-2): its source, a fragment per
         * calculation, every field of its order read or calculated; and the
         * schema its entries parse with, the fields read and calculated.
         */
        const wired = (name, path, query) => {
            const source = adapter.sources[name];
            const calculated = query.calculations.map((calculation) => ({
                calculation,
                fragment: adapter.calculations?.[calculation.path],
            }));
            const faults = [
                ...(source === undefined
                    ? [`${path}: the adapter gives no source of ${name} (ADP-8)`]
                    : []),
                ...calculated.flatMap(({ calculation, fragment }) => fragment === undefined
                    ? [`${path}: the adapter gives no fragment of ${calculation.path} (ADP-8)`]
                    : []),
                ...query.order.flatMap(([field]) => source === undefined ||
                    field in source.fields ||
                    query.calculations.some((calculation) => calculation.name === field)
                    ? []
                    : [`${path}: the adapter reads no field ${field} of its order (ADP-8)`]),
            ];
            // The fields read, and the calculated ones beside them, if any: a
            // schema with refinements cannot be extended, so one that calculates
            // nothing is parsed as it is.
            const entry = query.calculations.length === 0
                ? query.fields
                : query.fields.extend(Object.fromEntries(query.calculations.map((calculation) => [calculation.name, calculation.value])));
            return { source, calculated, faults, entry };
        };
        const port = (name, path, query, identity, wiring, served, actions) => {
            const strategy = adapter.streams[name];
            const streamed = strategy !== undefined;
            /** An entry the adapter read, parsed by its fields: the read ones, those it calculated. */
            const parsed_entry = (stored) => {
                const parsed = wiring.entry.safeParse(stored);
                if (!parsed.success) {
                    throw new Error(`${path}: the adapter gives an entry its fields do not parse (ADP-8): ${parsed.error.message}`);
                }
                return parsed.data;
            };
            const plan_of = (context, input) => {
                const source = wiring.source;
                if (source === undefined)
                    throw new Error(`${path}: the adapter gives no source (ADP-8)`);
                const schema = is_a_schema(query.input) ? query.input : called(query.input, context);
                if (!is_a_schema(schema))
                    throw new Error(`${path}: a query's input is not a schema (DOM-21)`);
                const parsed = schema.safeParse(input);
                if (!parsed.success)
                    return undefined;
                const bound = called(called(query.creator, context), parsed.data);
                if (!is_a_record(bound))
                    throw new Error(`${path}: the creator binds no selection`);
                const calculations = bound['calculations'];
                const calculated = Object.fromEntries(wiring.calculated.map(({ calculation, fragment }) => {
                    if (fragment === undefined) {
                        throw new Error(`${path}: the adapter gives no fragment of ${calculation.path} (ADP-8)`);
                    }
                    return [
                        calculation.name,
                        fragment(calculation.parameters.parse(is_a_record(calculations) ? calculations[calculation.name] : undefined)),
                    ];
                }));
                const fields = { ...source.fields, ...calculated };
                return {
                    from: source.from,
                    fields,
                    identity: { field: query.identity, path: identity },
                    // The leaves of its actions known on each entry, as one more field
                    // the adapter evaluates in the snapshot (SC-33, `PlannedLeaves`).
                    ...(actions === undefined
                        ? {}
                        : {
                            leaves: {
                                field: action_leaves,
                                of: (entry) => actions.conditions(context, parsed_entry(entry)),
                            },
                        }),
                    selection: folded(binding(query.selection, bound['selection'])),
                    order: query.order.map(([field, direction]) => {
                        const fragment = fields[field];
                        if (fragment === undefined) {
                            throw new Error(`${path}: the adapter reads no field ${field} of its order (ADP-8)`);
                        }
                        return [fragment, direction];
                    }),
                };
            };
            /**
             * An entry as a reader meets it: parsed by its fields; with actions,
             * the values of its leaves taken out and the applicability of each
             * action added under its name (SC-33).
             */
            const entry_of = (context) => (stored) => {
                if (actions === undefined)
                    return parsed_entry(stored);
                if (!is_a_record(stored))
                    return parsed_entry(stored);
                const { [action_leaves]: values, ...read } = stored;
                if (!Array.isArray(values)) {
                    throw new Error(`${path}: the adapter gives no values of its actions' leaves (SC-33)`);
                }
                const entry = parsed_entry(read);
                return is_a_record(entry)
                    ? { ...entry, ...actions.applicabilities(context, entry, values) }
                    : entry;
            };
            const identity_schema = query.fields.shape[query.identity];
            const wiring_of = (context, plan) => ({
                path,
                plan,
                read: adapter.read,
                entry_of: entry_of(context),
                identity_of: (stored) => {
                    if (!is_a_schema(identity_schema))
                        throw new Error(`${path}: its identity ${query.identity} is no field (LIB-9)`);
                    const parsed = identity_schema.safeParse(stored);
                    if (!parsed.success) {
                        throw new Error(`${path}: the adapter's stream gives an identity its field does not parse (ADP-8): ${parsed.error.message}`);
                    }
                    return parsed.data;
                },
                identity_in: (entry) => (is_a_record(entry) ? entry[query.identity] : undefined),
                of_the_domain,
                envelope_of,
            });
            // The snapshot, then, where the adapter streams the query, the events
            // from its position (DOM-2); from a position, the stream alone, a
            // resume. An input not in its schema reads nothing, whatever the
            // position (DOM-21).
            const invoked = async function* (context, input, from) {
                const plan = plan_of(context, input);
                if (plan === undefined) {
                    yield { event: 'invalid_request', reason: 'input_not_in_schema' };
                    return;
                }
                if (from !== undefined) {
                    if (strategy === undefined) {
                        throw new Error(`${path}: the adapter does not stream it, so it reads from no position (DOM-2, LIB-8)`);
                    }
                    yield* stream_from(wiring_of(context, plan), strategy, from);
                    return;
                }
                const read = await adapter.read(plan);
                const entries = read.entries.map(entry_of(context));
                yield { event: 'snapshot', entries, position: read.position, total: entries.length };
                if (strategy === undefined)
                    return;
                yield* stream_after(wiring_of(context, plan), strategy, {
                    position: read.position,
                    entries,
                });
            };
            /** The order key of an entry as the adapter gave it: each field of the order, its value (LIB-9). */
            const key_of_entry = (stored) => query.order.map(([name]) => {
                const value = is_a_record(stored) ? stored[name] : undefined;
                return value === undefined ? [name] : [name, value];
            });
            /**
             * The values of the query's order key a cursor encodes, field by field;
             * none when it encodes no order key, or another order's (its fields by
             * name, in order), or a value its field does not parse (SC-22).
             */
            const decoded = (sent) => {
                const key = typeof sent === 'string' ? key_of(sent) : undefined;
                if (key?.length !== query.order.length)
                    return undefined;
                const values = query.order.map(([name], i) => {
                    const pair = key[i];
                    if (pair?.[0] !== name)
                        return undefined;
                    const value = pair.length === 2 ? pair[1] : undefined;
                    const schema = wiring.entry.shape[name];
                    return is_a_schema(schema) && schema.safeParse(value).success ? { value } : undefined;
                });
                return values.every((each) => each !== undefined)
                    ? values.map((each) => each.value)
                    : undefined;
            };
            /** A page's selection: the query's, after the order key's values if there are some (D109). */
            const selection_after = (plan, values) => values === undefined
                ? plan.selection
                : adapter.algebra.and([
                    plan.selection,
                    adapter.algebra.after(plan.order.map(([field, direction], i) => ({
                        field,
                        direction,
                        value: values[i],
                    }))),
                ]);
            // In pages (SC-22): a stream of snapshots, one per page, each read when
            // the consumer asks for it, at its own position, with its total; the
            // page's last entry's order key the cursor of the next, if one follows
            // (the adapter gives one entry more than the page to tell). An input
            // not in its schema reads nothing, then a cursor that does not decode
            // to the query's order key.
            const pages = async function* (context, input, page) {
                const plan = plan_of(context, input);
                if (plan === undefined) {
                    yield { event: 'invalid_request', reason: 'input_not_in_schema' };
                    return;
                }
                const asked = page_asked.safeParse(page);
                if (!asked.success) {
                    throw new Error(`${path}: a page is its size, a whole number at least 1, which the leaf's schema bounds, and its cursor (SC-22): ${asked.error.message}`);
                }
                const { size, after } = asked.data;
                let values = after === undefined ? undefined : decoded(after);
                if (after !== undefined && values === undefined) {
                    yield { event: 'invalid_request', reason: 'cursor_not_in_schema' };
                    return;
                }
                for (;;) {
                    const read = await adapter.page({
                        ...plan,
                        page: selection_after(plan, values),
                        ...(size === undefined ? {} : { limit: size + 1 }),
                    });
                    const entries = size === undefined ? read.entries : read.entries.slice(0, size);
                    const last = entries.at(-1);
                    const more = size !== undefined && read.entries.length > size && last !== undefined;
                    const key = more ? key_of_entry(last) : undefined;
                    yield {
                        event: 'snapshot',
                        entries: entries.map(entry_of(context)),
                        position: read.position,
                        total: read.total,
                        ...(key === undefined ? {} : { next: cursor_of(key) }),
                    };
                    if (key === undefined)
                        return;
                    values = key.map((pair) => (pair.length === 2 ? pair[1] : undefined));
                }
            };
            const fragments = adapter.applicability?.[name];
            return serving(Object.assign(invoked, {
                streamed,
                pages,
                // The port again, its entries with the applicability of each action
                // (SC-33), where the adapter evaluates them (D110); not on itself.
                ...(fragments === undefined || !is_a_record(fragments) || actions !== undefined
                    ? {}
                    : {
                        with_actions: (given) => port(name, path, query, identity, wiring, served, planned_actions(path_of, actions_in(given, path), fragments)),
                    }),
            }), served);
        };
        const built = queries.flatMap((each) => 'fault' in each ? [] : [{ ...each, wiring: wired(each.name, each.path, each.query) }]);
        // A stream carries the facts of its domain (DOM-17), which the store's
        // versions read (DOM-22, CFG-2): where the adapter streams a query, every
        // fact of the registry is of a domain whose majors they were given.
        const streaming = built.filter((each) => adapter.streams[each.name] !== undefined);
        const unread = Object.entries(ports.registry).flatMap(([path, component]) => kind_of(component)?.kind === 'fact' && !ports.versions[$Versions].reads(path) ? [path] : []);
        const wiring_faults = [
            ...built.flatMap((each) => each.wiring.faults),
            ...(streaming.length > 0 && unread.length > 0
                ? [
                    `the streams of ${streaming.map((each) => each.path).join(', ')} carry ${unread.join(', ')}, of no domain whose majors the versions were given (DOM-22, CFG-2)`,
                ]
                : []),
        ];
        if (wiring_faults.length > 0)
            throw new Error(wiring_faults.join('\n'));
        return Object.fromEntries(built.map((each) => [
            each.name,
            port(each.name, each.path, each.query, each.identity, each.wiring, {
                component: ports.use_cases[each.name],
                path: each.path,
                // What a leaf over it needs to find the part of a fact that touches
                // an entry (DOM-17, part 6.3): the identity's path, the facts it names.
                read: {
                    identity: each.identity,
                    facts: (ports.use_cases[each.name]?.[$UseCase].facts ?? []).flatMap((fact) => {
                        const fact_path = path_of(fact);
                        return fact_path === undefined ? [] : [fact_path];
                    }),
                },
            }),
        ]));
    };
};

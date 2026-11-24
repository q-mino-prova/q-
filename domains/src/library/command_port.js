import * as z from 'zod';
import { date_time } from "./format.js";
import { $Command, $Composition, $Each, entry_id, is_a_command, } from "./command.js";
import { $Step } from "./step.js";
import { facts_of_a_step, step_parts, step_port, } from "./step_port.js";
import { $Node } from "./node.js";
import { $UseCase } from "./use_case.js";
import { $Version } from "./version.js";
import { $Versions } from "./registry.js";
import { is_a_schema, kind_of } from "./kind.js";
import { bind, failures_of, fold, holds_on, leaves_of, } from "./bound_condition.js";
import { resources_of } from "./resources.js";
import { read_fields, written } from "./plan.js";
import { $Recorded, called, folder_of, is_a_record, is_at_or_above, paths_in, serving, } from "./runtime.js";
/** The version of every domain in a registry, by its folder (`version.ts`, DOM-22). */
const versions_in = (registry) => Object.entries(registry).flatMap(([path, entry]) => typeof entry === 'object' && $Version in entry ? [[folder_of(path), entry[$Version]]] : []);
/**
 * The version a component is written at: its domain's when written
 * (DOM-10, DOM-22), the version of the nearest folder above it that
 * declares one.
 */
const version_at = (versions) => (path) => {
    const nearest = versions
        .filter(([folder]) => is_at_or_above(folder, folder_of(path)))
        .toSorted(([a], [b]) => b.length - a.length)[0];
    if (nearest === undefined) {
        throw new Error(`${path} is of no domain whose version the registry gives (DOM-22)`);
    }
    return nearest[1];
};
/**
 * The nodes above a use case, outer first, met as the library walks its
 * path down. Of a node, the command ports run what a business node
 * declares (`binds`, `requires`); what a persona's node declares runs at
 * its tree's leaf (PER-6).
 */
export const nodes_above = (registry) => (use_case) => Object.entries(registry)
    .flatMap(([path, entry]) => {
    if (typeof entry !== 'object' ||
        !($Node in entry) ||
        !is_at_or_above(folder_of(path), folder_of(use_case))) {
        return [];
    }
    const declared = { ...entry[$Node].declared };
    const persona = ['takes', 'looks_up', 'is_found_only_if', 'is_refused_unless', 'gives'];
    if (persona.some((part) => declared[part] !== undefined)) {
        throw new Error(`${path} looks up, takes or gives: a node of a business tree binds and requires (D105)`);
    }
    const binds = declared['binds'];
    const requires = declared['requires'];
    return [
        {
            path,
            binds: binds instanceof z.ZodObject ? binds : undefined,
            requires: is_a_schema(requires) ? requires : undefined,
            creator: declared['creator'],
        },
    ];
})
    .toSorted((a, b) => a.path.split('/').length - b.path.split('/').length);
/**
 * What a node binds, from the flat input (D105.2): the fields its schema
 * names, parsed by it; nothing for a node that binds none; none at all
 * when they are not in its schema.
 */
export const bound_by = (node, input) => {
    if (node.binds === undefined)
        return {};
    if (!is_a_record(input))
        return undefined;
    const parsed = node.binds.safeParse(Object.fromEntries(Object.keys(node.binds.shape).flatMap((key) => (key in input ? [[key, input[key]]] : []))));
    return parsed.success ? parsed.data : undefined;
};
/** A command's parts, or none for a step (DOM-20), whose port comes with its plan. */
export const command_parts = (command) => {
    if ($Step in command)
        return undefined;
    const outcomes = command[$Command].outcomes;
    if (outcomes === undefined)
        return undefined;
    return { creator: command, input: 'input' in command ? command.input : undefined, outcomes };
};
/**
 * The facts a command records, its branches' and those of the transitions
 * they compose (DOM-19): what its duplicate branch reads back through the
 * versions of the store, which must read their domain (CFG-2).
 */
const facts_recorded = (command) => Object.values(command.outcomes).flatMap(([, fact, , composition]) => [
    fact,
    ...(composition === undefined
        ? []
        : Object.values(composition[$Composition]).flatMap((composed) => {
            const transition = command_parts($Each in composed ? composed[$Each] : composed);
            return transition === undefined
                ? []
                : Object.values(transition.outcomes).map(([, recorded]) => recorded);
        })),
]);
/** A branch's entry as the creator resolves it (DOM-13): its id, its payload, when it may go. */
const resolved_entry = z.strictObject({
    id: entry_id,
    payload: z.unknown(),
    not_before: date_time.optional(),
});
/** The single transitions a plan composes, in the order written. */
const singles_of = (plan) => plan.compositions.flatMap((composition) => (composition.composes === 'one' ? [composition] : []));
/** The transitions on a list a plan composes, in the order written. */
const lists_of = (plan) => plan.compositions.flatMap((composition) => (composition.composes === 'each' ? [composition] : []));
/** The branch of each single transition a plan applies, in the order written. */
const combined = (plan) => singles_of(plan).map((composition, i) => {
    const part = composition.branches[plan.combination[i] ?? -1];
    if (part === undefined)
        throw new Error(`no branch of ${composition.name} is planned`);
    return part;
});
/**
 * Every combination of one branch per single transition, the first
 * transition's varying slowest (SC-10): the adapter applies the first that
 * holds, so each transition applies the first of its branches that holds,
 * as a command does; one combination, none, for a branch that composes
 * nothing.
 */
const combinations = (sizes) => sizes.reduce((prefixes, size) => prefixes.flatMap((prefix) => Array.from({ length: size }, (_, i) => [...prefix, i])), [[]]);
/**
 * The parts a plan writes (D111, D113.2): its own, then, in the order its
 * composition is written, each single transition's branch of the plan's
 * combination, and, for a list, the branch each element chose (`elements`,
 * the adapter's choice, element by element in the order of the lists),
 * in the order of the list.
 */
const chosen_parts = (plan, elements) => {
    const singles = combined(plan);
    const walked = plan.compositions.reduce((at, composition) => {
        if (composition.composes === 'one') {
            const part = singles[at.single];
            if (part === undefined)
                throw new Error(`no branch of ${composition.name} is planned`);
            return {
                single: at.single + 1,
                element: at.element,
                parts: [...at.parts, part],
                composed: { ...at.composed, [composition.name]: part.name },
            };
        }
        const chosen = composition.elements.map((branches, i) => {
            const part = branches[elements[at.element + i] ?? -1];
            if (part === undefined) {
                throw new Error(`the adapter chose no branch of ${composition.name} for its element ${String(i + 1)} (SC-54)`);
            }
            return part;
        });
        return {
            single: at.single,
            element: at.element + composition.elements.length,
            parts: [...at.parts, ...chosen],
            composed: { ...at.composed, [composition.name]: chosen.map((part) => part.name) },
        };
    }, { single: 0, element: 0, parts: [plan.own], composed: {} });
    if (walked.element !== elements.length) {
        throw new Error('the adapter chose branches for elements the plan does not have (SC-54)');
    }
    return { parts: walked.parts, composed: walked.composed };
};
/**
 * The parts a branch composed, by the names of its composition (SC-10,
 * SC-54, `ComposedParts`): from the parts of its fact after its own, in
 * order, and the branch each applied, as written with the fact, so that a
 * retry reads them as the first request did.
 */
const composed_parts = (composition, branches, parts) => {
    const part_at = (at, branch) => {
        const part = parts[at];
        if (part === undefined)
            throw new Error('a fact holds fewer parts than its branch composed (DOM-10)');
        return { branch, fact: part.payload };
    };
    const walked = Object.entries(composition).reduce((walked, [name, transition]) => {
        const stored = branches[name];
        if (stored === undefined)
            throw new Error(`a fact names no branch of ${name} (DOM-10)`);
        if ($Each in transition) {
            if (typeof stored === 'string')
                throw new Error(`a fact names one branch of the list ${name}`);
            return {
                at: walked.at + stored.length,
                composed: {
                    ...walked.composed,
                    [name]: stored.map((branch, i) => part_at(walked.at + i, branch)),
                },
            };
        }
        if (typeof stored !== 'string')
            throw new Error(`a fact names a list for ${name}`);
        return {
            at: walked.at + 1,
            composed: { ...walked.composed, [name]: part_at(walked.at, stored) },
        };
    }, { at: 1, composed: {} });
    if (walked.at !== parts.length) {
        throw new Error('a fact holds parts its branch did not compose (DOM-10)');
    }
    return walked.composed;
};
/** The values of a plan's leaves cut by condition: the path's, its own, each single transition's, each element's branches'. */
const segments_of = (path, plan, values) => [
    ...path,
    plan.own.bound,
    ...combined(plan).map((part) => part.bound),
    ...lists_of(plan).flatMap((list) => list.elements.flatMap((branches) => branches.map((part) => part.bound))),
].reduce((walked, bound) => {
    const size = leaves_of(bound).length;
    return {
        at: walked.at + size,
        segments: [...walked.segments, values.slice(walked.at, walked.at + size)],
    };
}, { at: 0, segments: [] }).segments;
/**
 * The failures of a transition a branch composes (SC-10, SC-54): none when
 * one of its branches holds, as an OR's components; when none does, every
 * branch's, under the transition's name and the branch's, then the
 * components of the leaf where it stands (DOM-6).
 */
const transition_failures = (branch, transition, judged) => judged.some(({ part, values }) => holds_on(part.bound, values))
    ? []
    : judged.flatMap(({ part, values }) => failures_of(part.bound, values).map((leaf) => ({
        branch,
        components: [transition, part.name, ...leaf.components],
        predicate: leaf.path,
    })));
/** Failures once each: two elements of a list fail where their names stand alike (SC-54). */
const once_each = (failures) => failures.filter((failure, i) => failures.findIndex((other) => JSON.stringify(other) === JSON.stringify(failure)) === i);
export function command_use_case_ports(ports) {
    return runtime_ports(ports);
}
/** The body of `command_use_case_ports`, typed by what it meets at runtime. */
const runtime_ports = (ports) => {
    const path_of = paths_in(ports.registry);
    const binding = bind(path_of);
    const version_of = version_at(versions_in(ports.registry));
    const identity_path_of = paths_in({ ...ports.identities, ...ports.registry });
    const identity = (schema) => {
        if (kind_of(schema)?.kind !== 'id')
            return undefined;
        const path = identity_path_of(schema);
        if (path === undefined) {
            throw new Error('a fact holds an identity that no registry given names: give the registry of its domain (identities, DOM-10)');
        }
        return path;
    };
    const resources = resources_of(identity);
    const read_part = (stored) => ports.versions[$Versions].part(stored);
    const named = (component) => {
        const path = path_of(component);
        if (path === undefined)
            throw new Error('a branch names a component no registry given names (DOM-24)');
        return path;
    };
    const nodes_of = nodes_above(ports.registry);
    // The steps among the use cases' commands (DOM-20), by the use case's
    // name, with the faults of their declarations (CFG-2): a step below a
    // business node that binds or requires comes with its case (D105, LIB-3).
    const step_of = step_parts(path_of);
    const declared_steps = Object.entries(ports.use_cases).flatMap(([name, use_case]) => {
        const path = path_of(use_case);
        if (path === undefined)
            return [];
        const step = step_of(path, use_case[$UseCase].command);
        if (step === undefined)
            return [];
        const guarded = nodes_of(path).some((node) => node.binds !== undefined || node.requires !== undefined);
        const faults = [
            ...('creator' in step ? [] : step),
            ...(guarded
                ? [`${path}: a step below a node that binds or requires comes with its case (DOM-20, D105)`]
                : []),
        ];
        return [{ name, path, step, faults }];
    });
    const step_faults = declared_steps.flatMap((each) => each.faults);
    if (step_faults.length > 0)
        throw new Error(step_faults.join('\n'));
    const steps = new Map(declared_steps.flatMap(({ name, step }) => ('creator' in step ? [[name, step]] : [])));
    // At wiring (CFG-2): the facts the ports record, and read back, are of
    // domains whose majors the store's versions were given (DOM-22): a
    // command's and the transitions it composes, a step's own and its
    // transition's (part 7.4).
    const unread = Object.entries(ports.use_cases)
        .flatMap(([name, use_case]) => {
        const step = steps.get(name);
        if (step !== undefined)
            return facts_of_a_step(step);
        const command = command_parts(use_case[$UseCase].command);
        return command === undefined ? [] : facts_recorded(command);
    })
        .flatMap((fact) => {
        const path = path_of(fact);
        return path === undefined || ports.versions[$Versions].reads(path) ? [] : [path];
    });
    if (unread.length > 0) {
        throw new Error(`the use cases record ${[...new Set(unread)].join(', ')}, of no domain whose majors the versions were given (DOM-22, CFG-2)`);
    }
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
         * The input parsed (DOM-21): the target each node of the path binds,
         * from the flat input, by its schema, given down in the context, never
         * rewritten (D105.2); each node's requirement bound by its creator; the
         * rest, the command's input, by its schema, built over the context
         * where it is a function of it.
         */
        const parse = (command, path, context, input) => {
            const seen = Object.fromEntries(Object.entries(context).filter(([key]) => key !== 'correlation' && key !== 'fingerprint'));
            const bound_keys = path.flatMap((node) => Object.keys(node.binds?.shape ?? {}));
            if (bound_keys.length > 0 && !is_a_record(input))
                return { parsed: 'invalid' };
            const walked = path.reduce((above, node) => {
                if (above === undefined)
                    return undefined;
                const taken = bound_by(node, input);
                if (taken === undefined)
                    return undefined;
                const requirement = node.requires === undefined
                    ? []
                    : [binding(node.requires, called(called(node.creator, above.context), taken))];
                return {
                    context: { ...above.context, ...taken },
                    path: [...above.path, ...requirement],
                };
            }, { context: seen, path: [] });
            if (walked === undefined)
                return { parsed: 'invalid' };
            const own = is_a_record(input)
                ? Object.fromEntries(Object.entries(input).filter(([key]) => !bound_keys.includes(key)))
                : input;
            const schema = is_a_schema(command.input)
                ? command.input
                : called(command.input, walked.context);
            if (!is_a_schema(schema))
                throw new Error("a command's input is not a schema (DOM-21)");
            const parsed = schema.safeParse(own);
            return parsed.success
                ? { parsed: 'valid', context: walked.context, input: parsed.data, path: walked.path }
                : { parsed: 'invalid' };
        };
        /** A branch's part planned (DOM-10, DOM-13): its condition bound, its fact in its part, its write, its entries. */
        /**
         * A fact's part planned, with no condition (DOM-10): its payload parsed
         * by the fact, its resources, its domain's version, its write. A
         * branch's own and a step's (DOM-20).
         */
        const fact_part = (fact, resolved) => {
            const fact_path = named(fact);
            const payload = fact.parse(resolved);
            const write = adapter.write[fact_path];
            if (write === undefined)
                throw new Error(`the adapter gives no write of ${fact_path} (ADP-8)`);
            return {
                part: {
                    path: fact_path,
                    payload,
                    resources: resources(fact, payload),
                    version: version_of(fact_path),
                },
                write: write(payload),
            };
        };
        const planned_part = (name, declared, resolved) => {
            if (!Array.isArray(resolved))
                throw new Error(`the creator resolves no branch ${name}`);
            const [condition, fact, entries] = declared;
            const bound = binding(condition, resolved[0]);
            const own = fact_part(fact, resolved[1]);
            const queued = resolved[2] ?? {};
            const entry_of = ([entry_name, effect]) => {
                const entry = resolved_entry.parse(is_a_record(queued) ? queued[entry_name] : undefined);
                const effect_path = named(effect);
                return {
                    effect: effect_path,
                    id: entry.id,
                    version: version_of(effect_path),
                    payload: effect.parse(entry.payload),
                    ...(entry.not_before === undefined ? {} : { not_before: entry.not_before }),
                    resources: own.part.resources,
                };
            };
            return { name, bound, ...own, entries: Object.entries(entries ?? {}).map(entry_of) };
        };
        /**
         * A transition a branch composes, planned on the input its creator gives
         * it (SC-10, D111): a command of the use case's domain with no use case
         * of its own, its input parsed by its schema, built over the context of
         * the use case's point (DOM-21), its creator resolving its branches,
         * each planned as a part; none when its input is not in its schema. It
         * composes nothing in turn (LIB-3); one below a node the use case's path
         * does not cross comes with its case (DOM-5).
         */
        const planned_transition = (context, above) => (name, transition, input) => {
            const command = command_parts(transition);
            const path = path_of(transition);
            if (command === undefined || path === undefined) {
                throw new Error(`${name} composes no command of the registry given (DOM-19)`);
            }
            if (nodes_of(path).some((node) => !above.includes(node.path))) {
                throw new Error(`${path} is below a node the use case's path does not cross: a transition composed below a node comes with its case (DOM-5)`);
            }
            if (Object.values(command.outcomes).some(([, , , composition]) => composition !== undefined)) {
                throw new Error(`${path} composes in turn: a composed transition composes nothing (DOM-19)`);
            }
            const schema = is_a_schema(command.input) ? command.input : called(command.input, context);
            if (!is_a_schema(schema))
                throw new Error(`${path}: its input is not a schema (DOM-21)`);
            const parsed = schema.safeParse(input);
            if (!parsed.success)
                return undefined;
            const resolved = called(called(command.creator, context), parsed.data);
            if (!is_a_record(resolved))
                throw new Error(`${path}: the creator resolves no branches`);
            return Object.entries(command.outcomes).map(([branch, declared]) => planned_part(branch, declared, resolved[branch]));
        };
        /**
         * What a branch composes, planned (SC-10, SC-54): each transition on the
         * input the creator gives it under its name, a list's on each element's,
         * in the order of the list; none when an input is not in its
         * transition's schema.
         */
        const planned_compositions = (context, above) => (name, composition, inputs) => {
            if (composition === undefined)
                return [];
            const transitioned = planned_transition(context, above);
            const planned = Object.entries(composition[$Composition]).map(([key, composed]) => {
                const input = is_a_record(inputs) ? inputs[key] : undefined;
                if ($Each in composed) {
                    if (!Array.isArray(input)) {
                        throw new Error(`${name}: the creator gives ${key} no list of inputs (SC-54)`);
                    }
                    const elements = input.map((element) => transitioned(key, composed[$Each], element));
                    return elements.every((element) => element !== undefined)
                        ? { composes: 'each', name: key, elements }
                        : undefined;
                }
                const branches = transitioned(key, composed, input);
                return branches === undefined ? undefined : { composes: 'one', name: key, branches };
            });
            return planned.every((each) => each !== undefined) ? planned : undefined;
        };
        /**
         * A branch planned, as the adapter meets it: its condition after the
         * path's; if it composes, once per combination of its single
         * transitions' branches, each one's condition after its own (SC-10), so
         * that the adapter meets plain branches; if it composes on a list, each
         * element's branches apart, for the adapter to choose, and what it writes
         * a function of the choice (`applies`, SC-54). None when an input it
         * composes is not in its schema.
         */
        const planned_branches = (context, parsed, above) => (name, declared, resolved) => {
            if (!Array.isArray(resolved))
                throw new Error(`the creator resolves no branch ${name}`);
            const own = planned_part(name, declared, resolved);
            const [, , , composition] = declared;
            const compositions = planned_compositions(parsed.context, above)(name, composition, resolved[3]);
            if (compositions === undefined)
                return undefined;
            const sizes = compositions.flatMap((each) => each.composes === 'one' ? [each.branches.length] : []);
            return combinations(sizes).map((combination) => {
                const plan = { own, compositions, combination };
                const conditions = [
                    ...parsed.path,
                    own.bound,
                    ...combined(plan).map((part) => part.bound),
                ];
                const condition = conditions.length === 1
                    ? folded(own.bound)
                    : adapter.algebra.and(conditions.map(folded));
                const leaves = conditions.flatMap(leaves_of).map(fragment_of);
                const writes = (elements) => written(context, name)(chosen_parts(plan, elements));
                const lists = lists_of(plan);
                return {
                    ...plan,
                    name,
                    branch: lists.length === 0
                        ? { condition, leaves, ...writes([]) }
                        : {
                            condition,
                            leaves,
                            elements: lists.flatMap((list) => list.elements.map((branches) => branches.map((part) => ({
                                condition: folded(part.bound),
                                leaves: leaves_of(part.bound).map(fragment_of),
                            })))),
                            applies: writes,
                        },
                };
            });
        };
        /**
         * The failed predicates of a rejection (DOM-6): the path's once, with no
         * branch (D105.4); then each branch's, once whatever its plans: its own
         * condition's, then each transition's it composes on which no branch
         * holds, every branch's, under the transition's name and the branch's
         * (SC-10); on a list, each element's on which none holds, under the
         * transition's name, once each (SC-54: the element itself comes with
         * its case, D113.1).
         */
        const failures = (path, planned, leaves) => {
            const cut = planned.map((plan, i) => ({
                plan,
                segments: segments_of(path, plan, leaves[i] ?? []),
            }));
            const in_the_path = path.flatMap((bound, i) => failures_of(bound, cut[0]?.segments[i] ?? []).map((leaf) => ({
                components: leaf.components,
                predicate: leaf.path,
            })));
            const names = planned
                .map((plan) => plan.name)
                .filter((name, i, all) => all.indexOf(name) === i);
            const of_the_branches = names.flatMap((name) => {
                const copies = cut.filter((copy) => copy.plan.name === name);
                const first = copies[0];
                if (first === undefined)
                    return [];
                const own_at = path.length;
                const own = failures_of(first.plan.own.bound, first.segments[own_at] ?? []).map((leaf) => ({
                    branch: name,
                    components: leaf.components,
                    predicate: leaf.path,
                }));
                const singles = singles_of(first.plan);
                const of_the_transitions = singles.flatMap((composition, s) => transition_failures(name, composition.name, composition.branches.map((part, j) => ({
                    part,
                    values: copies.find((copy) => copy.plan.combination[s] === j)?.segments[own_at + 1 + s] ??
                        [],
                }))));
                const of_the_elements = lists_of(first.plan)
                    .flatMap((list) => list.elements.map((branches) => ({ name: list.name, branches })))
                    .reduce((walked, element) => ({
                    at: walked.at + element.branches.length,
                    failed: [
                        ...walked.failed,
                        ...transition_failures(name, element.name, element.branches.map((part, j) => ({
                            part,
                            values: first.segments[walked.at + j] ?? [],
                        }))),
                    ],
                }), { at: own_at + 1 + singles.length, failed: [] }).failed;
                return [...own, ...of_the_transitions, ...once_each(of_the_elements)];
            });
            return [...in_the_path, ...of_the_branches];
        };
        /** An applied outcome (DOM-7): its branch, its position, its fact, and, if the branch composes, the parts it composed by name. */
        const applied = (command, branch, position, fact, composed) => {
            const declared = command.outcomes[branch];
            const composition = declared?.[3];
            return {
                outcome: 'applied',
                branch,
                position,
                fact,
                ...(composition === undefined
                    ? {}
                    : { composed: composed_parts(composition[$Composition], composed, fact.parts) }),
            };
        };
        /**
         * The duplicate branch (DOM-11): the fact the operation recorded, with
         * the same fingerprint, as the outcome it was, its branch by name; with
         * another, the identity already used.
         */
        const duplicate = (context, command, recorded) => {
            if (recorded.fact.fingerprint !== context.fingerprint) {
                return { outcome: 'identity_already_used' };
            }
            return applied(command, recorded.fact.branch, recorded.position, {
                parts: recorded.fact.parts.map(read_part),
                operation: recorded.fact.operation,
                correlation: recorded.fact.correlation,
            }, recorded.fact.composed);
        };
        /** The outcome of an execution (DOM-7, DOM-11). */
        const outcome_of = (context, command, path, planned, execution) => {
            switch (execution.outcome) {
                case 'recorded':
                    return duplicate(context, command, execution);
                case 'applied': {
                    const plan = planned[execution.branch];
                    if (plan === undefined)
                        throw new Error('the adapter applied no planned branch');
                    const chosen = chosen_parts(plan, execution.elements);
                    return applied(command, plan.name, execution.position, {
                        parts: chosen.parts.map((part) => read_fields(part.part)),
                        operation: context.operation,
                        correlation: context.correlation,
                    }, chosen.composed);
                }
                case 'rejected':
                    return { outcome: 'rejected', failures: failures(path, planned, execution.leaves) };
            }
        };
        /**
         * What an operation recorded, looked up alone, before anything is
         * parsed (PER-5, "A retry after the input's window over `now` moved"):
         * the duplicate branch, outside the step; nothing, `not_recorded`.
         */
        const recorded_by = (command) => async (context) => {
            const recorded = await adapter.recorded(context.operation);
            return recorded === undefined
                ? { outcome: 'not_recorded' }
                : duplicate(context, command, recorded);
        };
        /**
         * An invocation (DOM-3): the duplicate branch first (DOM-11), looked up
         * before the input is parsed, so that a caller that is not a leaf, a
         * reaction delivered again or the executor returning, reads its fact
         * after the input's window over `now` moved (PER-5); then the input
         * parsed, planned, and the adapter's step, whose own duplicate branch
         * answers two tries racing (SC-11).
         */
        const executed = (use_case, command) => async function* (context, input) {
            const recorded = await recorded_by(command)(context);
            if (recorded.outcome !== 'not_recorded') {
                yield recorded;
                return;
            }
            const nodes = nodes_of(use_case);
            const parsed = parse(command, nodes, context, input);
            if (parsed.parsed === 'invalid') {
                yield { outcome: 'invalid_request' };
                return;
            }
            const resolved = called(called(command.creator, parsed.context), parsed.input);
            if (!is_a_record(resolved))
                throw new Error(`${use_case}: the creator resolves no branches`);
            const above = nodes.map((node) => node.path);
            const by_branch = Object.entries(command.outcomes).map(([name, declared]) => planned_branches(context, parsed, above)(name, declared, resolved[name]));
            if (!by_branch.every((plans) => plans !== undefined)) {
                yield { outcome: 'invalid_request' };
                return;
            }
            const planned = by_branch.flat();
            const execution = await adapter.execute({
                operation: context.operation,
                branches: planned.map((each) => each.branch),
            });
            yield outcome_of(context, command, parsed.path, planned, execution);
        };
        const port = (use_case, command) => Object.assign(executed(use_case, command), { [$Recorded]: recorded_by(command) });
        // The ports of the steps (part 7.4), over what the adapter gives for
        // them, every fault at wiring in one message (CFG-2).
        const stepping = adapter.steps === undefined
            ? undefined
            : step_port({
                path_of,
                fact_part,
                transition: (context, above) => (name, transition, input) => {
                    if (!is_a_command(transition)) {
                        throw new Error(`${name} composes no command of the registry given (DOM-19)`);
                    }
                    return planned_transition(context, above)(name, transition, input);
                },
                folded,
                fragment_of,
                read_part,
                recorded: adapter.recorded,
            }, adapter.steps);
        const built = Object.entries(ports.use_cases).map(([name, use_case]) => {
            const path = path_of(use_case);
            if (path === undefined) {
                return { name, fault: `the use case ${name} is not in the registry given (DOM-24)` };
            }
            const step = steps.get(name);
            if (step !== undefined) {
                const above = nodes_of(path).map((node) => node.path);
                const stepped = stepping === undefined
                    ? `${path}: the adapter gives nothing for the steps (ADP-8, DOM-20)`
                    : stepping(name, path, step, above);
                return typeof stepped === 'string'
                    ? { name, fault: stepped }
                    : { name, port: serving(stepped, { component: use_case, path }) };
            }
            const command = command_parts(use_case[$UseCase].command);
            if (command === undefined) {
                return { name, fault: `${path}: its command declares no branches (DOM-5)` };
            }
            return { name, port: serving(port(path, command), { component: use_case, path }) };
        });
        const faults = built.flatMap((each) => ('fault' in each ? [each.fault] : []));
        if (faults.length > 0)
            throw new Error(faults.join('\n'));
        return Object.fromEntries(built.flatMap((each) => 'port' in each ? [[each.name, each.port]] : []));
    };
};

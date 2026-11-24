import { $Composed } from "./condition.js";
import { is_a_schema } from "./kind.js";
/** Whether a value is a record, to read its fields. */
const is_a_record = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
/** The named schemas of a record, those that are schemas. */
const schemas_in = (components) => Object.entries(components).flatMap(([name, component]) => is_a_schema(component) ? [[name, component]] : []);
/**
 * How a condition is composed (DOM-5): its operands under its operator
 * (`$Composed`), NOT's value telling its own alone; none for a leaf.
 */
export const composition_of = (condition) => {
    const operands = $Composed in condition ? condition[$Composed] : undefined;
    if (!is_a_record(operands))
        return undefined;
    const not = operands['not'];
    if (is_a_schema(not))
        return { operator: 'not', operand: not };
    const and = operands['and'];
    if (is_a_record(and))
        return { operator: 'and', components: schemas_in(and) };
    const or = operands['or'];
    return is_a_record(or) ? { operator: 'or', components: schemas_in(or) } : undefined;
};
/**
 * A condition bound to its parameters, parsed once by the condition's schema
 * (which puts the brands on), then walked: AND and OR give each component the
 * field under its name, NOT gives its operand its own parameters (its schema
 * is a copy of its operand's), a leaf takes its path from `path_of`, the
 * registry read in reverse. A leaf with no path is a fault of the wiring.
 */
export const bind = (path_of) => (condition, parameters) => {
    const walk = (node, parsed) => {
        const composition = composition_of(node);
        if (composition === undefined) {
            const path = path_of(node);
            if (path === undefined) {
                throw new Error('a condition holds a leaf that no registry given names (DOM-24)');
            }
            return { operator: 'leaf', path, parameters: parsed };
        }
        if (composition.operator === 'not') {
            return { operator: 'not', operand: walk(composition.operand, parsed) };
        }
        return {
            operator: composition.operator,
            components: composition.components.map(([name, component]) => ({
                name,
                condition: walk(component, is_a_record(parsed) ? parsed[name] : undefined),
            })),
        };
    };
    return walk(condition, condition.parse(parameters));
};
/** A bound condition folded, every leaf with its components' names (an adapter's algebra, ADP-8). */
export const fold = (folding) => (bound) => {
    const walk = (node, components) => {
        switch (node.operator) {
            case 'leaf':
                return folding.leaf({ components, path: node.path, parameters: node.parameters });
            case 'not':
                return folding.not(walk(node.operand, components));
            case 'and':
            case 'or':
                return folding[node.operator](node.components.map((named) => walk(named.condition, [...components, named.name])));
        }
    };
    return walk(bound, []);
};
/** The leaves of a bound condition, in order: depth first, components in the order written. */
export const leaves_of = fold({
    leaf: (leaf) => [leaf],
    and: (components) => components.flat(),
    or: (components) => components.flat(),
    not: (operand) => operand,
});
/** How many leaves a bound condition has. */
const size = (bound) => leaves_of(bound).length;
/**
 * The failed leaves of a condition that does not hold, from the values of
 * its leaves in order (DOM-6, D17): a leaf fails when its value is not the
 * one its place asks for, so a leaf under NOT fails when it holds (the drill
 * is booked, under "no one booked the tool"). AND names its components that
 * fail, OR every component when none holds, NOT its operand's leaves that
 * hold where it asks them not to; a condition that holds names nothing.
 * Every leaf has its value, with no short-circuit (D51), so the failures are
 * the same in any order of evaluation. An interpreter rule (V10).
 */
export const failures_of = (bound, values) => judged(bound, values).blamed(true);
/** Whether a bound condition holds on the values of its leaves, in order (a transition's branch, SC-10). */
export const holds_on = (bound, values) => judged(bound, values).holds;
/** A bound condition judged on the values of its leaves, in order, with no short-circuit (D51). */
const judged = (bound, values) => {
    const judge = (node, components, at) => {
        switch (node.operator) {
            case 'leaf': {
                const holds = values[at] ?? false;
                return {
                    holds,
                    blamed: (expected) => (holds === expected ? [] : [{ components, path: node.path }]),
                };
            }
            case 'not': {
                const operand = judge(node.operand, components, at);
                return { holds: !operand.holds, blamed: (expected) => operand.blamed(!expected) };
            }
            case 'and':
            case 'or': {
                const offsets = node.components.reduce((starts, named) => [...starts, (starts.at(-1) ?? at) + size(named.condition)], [at]);
                const judged = node.components.map((named, i) => judge(named.condition, [...components, named.name], offsets[i] ?? at));
                const holds = node.operator === 'and'
                    ? judged.every((component) => component.holds)
                    : judged.some((component) => component.holds);
                return {
                    holds,
                    blamed: (expected) => holds === expected
                        ? []
                        : judged
                            .filter((component) => component.holds !== expected)
                            .flatMap((component) => component.blamed(expected)),
                };
            }
        }
    };
    return judge(bound, [], 0);
};

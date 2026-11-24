import { lookup_builder } from "./lookup.js";
import { calculation_builder, effect_builder, fact_builder, id_builder, predicate_builder, selection_builder, } from "./component.js";
import { and_builder, not_builder, or_builder } from "./condition.js";
import { delegate_builder, version_builder } from "./version.js";
import { command_builder } from "./command.js";
import { query_builder } from "./query.js";
import { cursor_step_builder } from "./step.js";
import { node_builder } from "./node.js";
import { command_use_case_builder, read_use_case_builder } from "./use_case.js";
import { command_use_case_over_builder } from "./command_leaf.js";
import { reaction_builder } from "./reaction.js";
import { read_use_case_over_builder } from "./read_leaf.js";
import { earlier_builder } from "./earlier.js";
/**
 * The builders bound to the context of a point of the tree, for its
 * `_scope.ts`. A folder with a node has two points: the point above, whose
 * builder of the node the generator writes in `_scope_node.ts`, and the
 * context the node gives, in `_scope.ts`, from which the scope of the leaves
 * takes its builders (`_scope_usecase.ts`); so that no import goes round.
 * Below a node of a business tree the point carries what the nodes above it
 * add to the commands (`accumulated`, `<node>_accumulated` in `_node.ts`,
 * SC-31), which its use cases take. The context, what closes and what
 * accumulates are the types': at runtime every point has the same builders.
 */
export const builders_at = () => ({
    id: id_builder,
    fact: fact_builder,
    predicate: predicate_builder,
    selection: selection_builder,
    calculation: calculation_builder,
    effect: effect_builder,
    AND: and_builder,
    OR: or_builder,
    NOT: not_builder,
    command: command_builder(),
    cursor_step: cursor_step_builder(),
    query: query_builder(),
    command_use_case: command_use_case_builder(),
    read_use_case: read_use_case_builder,
    command_use_case_over: command_use_case_over_builder(),
    read_use_case_over: read_use_case_over_builder(),
    lookup: lookup_builder,
    reaction: reaction_builder,
    node: node_builder(),
    version: version_builder,
    earlier: earlier_builder(),
    delegate: delegate_builder,
});

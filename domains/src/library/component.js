import { mark } from "./kind.js";
export const $Resources = Symbol('Resources');
export const $Calculation = Symbol('Calculation');
export const $Order = Symbol('Order');
// The builders' bodies (part 3.2): each copies the schema it is given, so that
// the component is an object of its own, and marks it with its kind.
export const id_builder = (id) => Object.assign(id.format.clone(), mark({ kind: 'id' }));
export const fact_builder = (fact) => Object.assign(fact.payload.clone(), fact.resources === undefined ? {} : { [$Resources]: fact.resources }, mark({ kind: 'fact' }));
export const predicate_builder = (predicate) => Object.assign(predicate.parameters.clone(), mark({ kind: 'predicate' }));
export const selection_builder = (selection) => Object.assign(selection.parameters.clone(), mark({ kind: 'selection', subject: selection.subject }));
export const calculation_builder = (calculation) => Object.assign(calculation.parameters.clone(), { [$Calculation]: { value: calculation.value } }, mark({ kind: 'calculation', subject: calculation.subject }));
export const effect_builder = (effect) => Object.assign(effect.payload.clone(), effect.order === undefined ? {} : { [$Order]: effect.order }, mark({ kind: 'effect' }));

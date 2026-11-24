import * as z from 'zod';
import { mark } from "./kind.js";
// Conditions (DOM-5, LIB-7): a branch's condition, a query's selection, a
// node's requirement, in a closed language: AND, OR, NOT and a leaf. The
// leaves of a composed condition are of one kind, checked by type where it is
// composed.
export const $Composed = Symbol('Composed');
// The builders' bodies (part 3.2): AND and OR a strict object of their named
// components, NOT a copy of its condition's schema, each with its operands
// under its operator, marked as a condition, whose kind is its file's.
/** A copy of a schema, its own object with the same definition. */
const copy = (schema) => schema.clone();
export const and_builder = (components) => Object.assign(z.strictObject(components), { [$Composed]: { and: components } }, mark({ kind: 'condition' }));
export const or_builder = (components) => Object.assign(z.strictObject(components), { [$Composed]: { or: components } }, mark({ kind: 'condition' }));
export const not_builder = (condition) => Object.assign(copy(condition), { [$Composed]: { not: condition } }, mark({ kind: 'condition' }));

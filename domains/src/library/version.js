import { kind_of, mark } from "./kind.js";
// Versions (DOM-22, PER-17, D75.6, D101, A, 16 Nov 2026 (7)): a domain has one
// version, semver, declared in its `version.ts`; a major that has passed keeps
// a folder of its own in the domain (`business/loans/1/`), outside the path,
// with every stored or published shape of that major: a component that
// changed, at the last minor of the major (`earlier`), and every other
// delegated to the next major (`delegate`). The current version knows no
// past: when a major leaves the window, its folder is deleted and nothing
// else changes. A minor keeps no folder: every shape it leaves still parses
// with the next minor's schema, which CI checks.
export const $Version = Symbol('Version');
export const $Earlier = Symbol('Earlier');
export const $Delegated = Symbol('Delegated');
// The builders' bodies (part 3.2): a version is its number; a delegation is
// the next major's component, and tells its kind, so that the generator meets
// it under the kind of the next's (`business/loans/1/fact/…`).
export const version_builder = (version) => ({
    [$Version]: version,
    ...mark({ kind: 'version' }),
});
export const delegate_builder = (next) => Object.assign({ [$Delegated]: next }, marked_as(next));
/** The mark of a component, for what stands for it in a past major: none if it has none. */
export const marked_as = (next) => {
    const kind = kind_of(next);
    return kind === undefined ? {} : mark(kind);
};

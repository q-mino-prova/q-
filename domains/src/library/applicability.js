export const $GivenByTheCaller = Symbol('GivenByTheCaller');
/**
 * A field of a command's input the caller gives later, not known at the
 * read (D51.3): Marta scans, at the desk, the tool she brings back. Explicit,
 * so that a field forgotten does not become not known unannounced. The
 * library carries it through the creators to the leaves, which are not known
 * where it reaches them; a creator binds and does not read it (a choice on
 * the input is a branch's, DOM-5): one that reads it leaves every leaf of
 * the command not known, a limit that reads it its own value (D51.4). [Q, C,
 * 18 Nov 2026 (2)]
 */
export const given_by_the_caller = { [$GivenByTheCaller]: true };

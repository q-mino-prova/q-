import { $Delegated, $Earlier, $Version } from "./version.js";
import { $Versions, } from "./registry.js";
import { is_a_schema } from "./kind.js";
import { folder_of, is_at_or_above } from "./runtime.js";
/** The major and the minor of a version. */
const major_and_minor = (version) => {
    const [major, minor] = version.split('.').map(Number);
    return [major ?? Number.NaN, minor ?? Number.NaN];
};
/** A function of the domain or the adapter called with its one argument (a step to the next major, a write): its result, unknown until parsed. */
const called = (what, callee, argument) => {
    if (typeof callee !== 'function')
        throw new Error(`${what} is not a function`);
    const result = Reflect.apply(callee, undefined, [argument]);
    return result;
};
/** The versions a registry declares (`version.ts`), with their paths: one for a current major, none for a past one. */
const declared_versions = (registry) => Object.entries(registry).flatMap(([path, entry]) => typeof entry === 'object' && $Version in entry ? [[path, entry[$Version]]] : []);
/**
 * A domain from its majors, or why the store cannot start with it: one of
 * its registries declares the version (its `version.ts`), under the major
 * that version names (DOM-22, A, 17 Nov 2026).
 */
const domain_of = (majors) => {
    const by_major = new Map(Object.entries(majors).map(([major, registry]) => [Number(major), registry]));
    const declared = [...by_major].flatMap(([major, registry]) => declared_versions(registry).map(([path, version]) => ({ major, path, version })));
    const [current] = declared;
    if (current === undefined || declared.length > 1) {
        return `majors given with ${String(declared.length)} versions declared: a domain's majors hold one current registry, whose version.ts declares its version (DOM-22)`;
    }
    const [major, minor] = major_and_minor(current.version);
    const folder = folder_of(current.path);
    if (major !== current.major) {
        return `${folder} is at ${current.version} by its version.ts, and its majors give it as major ${String(current.major)}: the current major is the one its version declares (DOM-22, CFG-2)`;
    }
    const registry = by_major.get(major) ?? {};
    return {
        folder,
        version: current.version,
        major,
        minor,
        majors: by_major,
        path_of: new Map(Object.entries(registry).map(([path, entry]) => [entry, path])),
    };
};
/** A stored path and version no major reads, and why. */
const unread = (stored, why) => ({
    read: false,
    why: `${stored.path} at ${stored.version}: ${why}`,
});
/**
 * From a component of a past major to the current one's, through the next
 * majors' components as each folder names them (`earlier`: its shape and its
 * step; `delegate`: the next's as it is), with the steps met; a component
 * that is neither is where the chain ends. The generator checks that every
 * next is the next major's (DOM-22).
 */
const chain = (component, steps) => {
    if (typeof component === 'object' && component !== null && $Delegated in component) {
        return chain(component[$Delegated], steps);
    }
    if (!is_a_schema(component) || !($Earlier in component))
        return { component, steps };
    const earlier = component[$Earlier];
    if (typeof earlier !== 'object' || earlier === null || !('next' in earlier)) {
        return 'a component of a past major with no next (DOM-22)';
    }
    return chain(earlier.next, [
        ...steps,
        { schema: component, to_next: 'to_next' in earlier ? earlier.to_next : undefined },
    ]);
};
/**
 * The chain of a stored path and version to the current shape (DOM-22): the
 * component of its path in the registry of the major it was written at,
 * then, while it is a past major's, its next major's (`earlier`: its shape
 * and its step; `delegate`: the next's as it is), until the current major's.
 */
const resolution = (domains) => (stored) => {
    const domain = domains.find((each) => is_at_or_above(each.folder, folder_of(stored.path)));
    if (domain === undefined) {
        return unread(stored, 'of no domain whose majors the store was given (DOM-22)');
    }
    const [major, minor] = major_and_minor(stored.version);
    if (major > domain.major || (major === domain.major && minor > domain.minor)) {
        return unread(stored, `newer than ${domain.folder} at ${domain.version}: written by a newer release, the reader stops and retries (DOM-22)`);
    }
    const registry = domain.majors.get(major);
    if (registry === undefined) {
        return unread(stored, `${domain.folder} keeps no folder of major ${String(major)}: deleted while the store keeps it (DOM-22, D101)`);
    }
    const chained = chain(registry[stored.path], []);
    if (typeof chained === 'string')
        return unread(stored, chained);
    const { component, steps } = chained;
    const path = domain.path_of.get(component);
    if (path === undefined || !is_a_schema(component)) {
        return unread(stored, `no component of ${domain.folder} at major ${String(major)} leads to one of ${domain.version} (DOM-22)`);
    }
    return { read: true, path, steps, current: component };
};
/** A payload at the current shape: through each step of the chain, then the current schema (DOM-22). */
const translated = (resolved, payload) => resolved.current.parse(resolved.steps.reduce((written, step) => called('a step to the next major', step.to_next, step.schema.parse(written)), payload));
/** The resolution of a path and a version, or the reader stops (throws), and retries. */
const read_or_stop = (resolve) => (stored) => {
    const resolved = resolve(stored);
    if (!resolved.read)
        throw new Error(`${resolved.why}: the reader stops`);
    return resolved;
};
export const versions = (majors) => async (store) => {
    const domains = majors.map(domain_of);
    const faults = domains.flatMap((domain) => (typeof domain === 'string' ? [domain] : []));
    const known = domains.flatMap((domain) => (typeof domain === 'string' ? [] : [domain]));
    const twice = known.filter((domain, i) => known.findIndex((each) => each.folder === domain.folder) !== i);
    const resolve = resolution(known);
    const kept = faults.length > 0 ? [] : await store.stored();
    const all = [
        ...faults,
        ...twice.map((domain) => `${domain.folder} given twice: one domain, one majors (DOM-22)`),
        ...kept.flatMap((stored) => {
            const resolved = resolve(stored);
            return resolved.read ? [] : [`the store keeps ${resolved.why}`];
        }),
    ];
    if (all.length > 0)
        throw new Error(all.join('\n'));
    const read = read_or_stop(resolve);
    return {
        [$Versions]: {
            part: (stored) => {
                const resolved = read(stored);
                return {
                    path: resolved.path,
                    payload: translated(resolved, stored.payload),
                    resources: stored.resources,
                };
            },
            entry: (stored) => {
                const resolved = read({ path: stored.effect, version: stored.version });
                return {
                    effect: resolved.path,
                    id: stored.id,
                    payload: translated(resolved, stored.payload),
                    ...(stored.not_before === undefined ? {} : { not_before: stored.not_before }),
                    resources: stored.resources,
                    correlation: stored.correlation,
                };
            },
            reads: (path) => known.some((domain) => is_at_or_above(domain.folder, folder_of(path))),
            path: (component) => known.map((domain) => domain.path_of.get(component)).find((path) => path !== undefined),
        },
    };
};
export function replay(replay) {
    const unread = Object.keys(replay.writes).filter((path) => !replay.versions[$Versions].reads(path));
    if (unread.length > 0) {
        throw new Error(`the writes name ${unread.join(', ')}, of no domain whose majors the versions were given (DOM-22, CFG-2)`);
    }
    const part = replay.versions[$Versions].part;
    return async function* (log) {
        for await (const event of log(undefined)) {
            switch (event.event) {
                case 'fact':
                    yield {
                        position: event.position,
                        writes: event.fact.parts.flatMap((stored) => {
                            const write = replay.writes[stored.path];
                            if (write === undefined)
                                return [];
                            return [called(`the write of ${stored.path}`, write, part(stored).payload)];
                        }),
                    };
                    break;
                case 'caught_up':
                    return;
                case 'position_unavailable':
                    throw new Error('the log keeps its first fact no longer: the state cannot be rebuilt from it (DOM-22)');
            }
        }
    };
}

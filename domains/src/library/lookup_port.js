import { $Lookup } from "./lookup.js";
import { called, is_a_record, paths_in, serving } from "./runtime.js";
// The body, typed by what it meets at runtime (DOM-25, "The ports, typed by
// their declaration").
export function lookup_ports(ports) {
    return runtime_lookup_ports(ports);
}
const runtime_lookup_ports = (ports) => {
    const path_of = paths_in(ports.registry);
    const lookups = Object.entries(ports.lookups).map(([name, lookup]) => ({
        name,
        lookup,
        path: path_of(lookup),
    }));
    const unknown_paths = lookups.flatMap((each) => each.path === undefined
        ? [`the lookup ${each.name} is not in the registry given (DOM-24)`]
        : []);
    if (unknown_paths.length > 0)
        throw new Error(unknown_paths.join('\n'));
    return (adapter) => {
        const missing = lookups.flatMap((each) => typeof adapter[each.name] === 'function'
            ? []
            : [`the adapter gives no lookup ${each.path ?? each.name} (CFG-2)`]);
        if (missing.length > 0)
            throw new Error(missing.join('\n'));
        return Object.fromEntries(lookups.map(({ name, lookup, path }) => {
            const where = path ?? name;
            const { key, value } = lookup[$Lookup];
            const ask = adapter[name];
            const port = async (sent) => {
                const parsed = key.safeParse(sent);
                if (!parsed.success) {
                    throw new Error(`${where}: a key its lookup does not parse, a fault of whoever asks`);
                }
                const answer = await called(ask, parsed.data);
                if (is_a_record(answer) && answer['answer'] === 'not_known') {
                    return { answer: 'not_known' };
                }
                if (!is_a_record(answer) || answer['answer'] !== 'known') {
                    throw new Error(`${where}: the adapter answers neither known nor not known (D30)`);
                }
                const found = value.safeParse(answer['value']);
                if (!found.success) {
                    throw new Error(`${where}: the adapter gives a value the lookup does not parse`);
                }
                return { answer: 'known', value: found.data };
            };
            return [name, serving(port, { component: lookup, path: where })];
        }));
    };
};

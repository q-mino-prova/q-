// A story of the gallery (WEB-28), in the Component Story Format (CSF 3,
// Storybook's): a file `<component>.stories.tsx` whose default export is
// its meta (`title`, `component`), and every other export a story, one per
// case, drawn by its `render`. So the stories go to Storybook as they are,
// if one day it is wanted. [Q, C, 24 Nov 2026]
import { isValidElement } from 'preact';
/** CSF's ids: words in lower case, joined by `-`. */
const the_id_of = (words) => words
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
/** A story's name from its export (`a_primary_gesture` → `A primary gesture`), as Storybook names it. */
const the_name_of = (key) => {
    const words = key.replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    return words.charAt(0).toUpperCase() + words.slice(1);
};
const a_record = (value) => typeof value === 'object' && value !== null;
/**
 * A story's `render`, a function: called with no argument, what it returns
 * unknown until it is checked as drawn (any function may be called so; CSF's
 * `args` are not passed, the gallery's stories take none).
 */
const a_render = (value) => typeof value === 'function';
/**
 * A module of stories, read as CSF reads it: its meta, then each export
 * with a `render` a story, in the order written. A module out of the form
 * is a fault of the gallery's, told by its name.
 */
export const the_file_of = (module) => {
    const meta = module['default'];
    if (!a_record(meta) || typeof meta['title'] !== 'string') {
        throw new Error('a file of stories with no meta');
    }
    const title = meta['title'];
    const file = the_id_of(title);
    const stories = Object.entries(module).flatMap(([key, value]) => {
        if (key === 'default' || !a_record(value))
            return [];
        const render = value['render'];
        if (!a_render(render))
            return [];
        const name = typeof value['name'] === 'string' ? value['name'] : the_name_of(key);
        return [
            {
                id: `${file}--${the_id_of(key)}`,
                name,
                render: () => {
                    const drawn = render();
                    if (!isValidElement(drawn))
                        throw new Error(`${title} ${name}: not drawn`);
                    return drawn;
                },
            },
        ];
    });
    return { id: file, title, stories };
};

import * as z from 'zod';
import { a_name } from "./values.js";
// The words of an extension (EXT-16, WEB-22; part 22.2): its texts the
// kernel draws for it, in one language, as data, so that no code of the
// extension runs to draw them: its name, the label of each of its actions,
// slots and pages, and the words of its own events on `self`, which tell
// how an action it carries out ended (USR-3, `the_extension_told_how_it_ended`).
// The extension writes them in its `texts/`, one file per language
// (`texts/it.json`), the one form the kernel reads: the kernel parses them
// with this schema and draws them in the extension's mark, never as its own
// words; a word it lacks is drawn as a fault. Its author may write the JSON
// by hand, checked by this schema and a test, or write a typed module
// (`texts/it.ts`, `satisfies Words<typeof manifest, typeof registry>`) whose
// build writes the JSON, as the manifest's (A, 22 Nov 2026). A part's
// texts are in its document, the extension's too.
/** A label of an extension's point (an action, a slot, a page), or its name: short, drawn on a gesture or a title. */
const a_label = z.string().min(1).max(64);
/** The words of an extension in one language: its name, its points' labels and its own events' words, each by its name in the manifest. */
export const the_words_of_an_extension = z.strictObject({
    name: a_label,
    actions: z.record(a_name, a_label),
    slots: z.record(a_name, a_label),
    pages: z.record(a_name, a_label),
    events: z.record(a_name, z.string().min(1).max(256)),
});

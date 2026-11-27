import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
import { useSignal } from '@preact/signals';
import { the_words_of_the_part as words } from "../texts/the_part.it.js";
// Greetings' part (EXT-16, K-3; part M4 of messaging): the test
// extension's slot, on a bond's screen and on its row in her contacts, the
// first part of an extension's package the kernel draws (GR-10: its
// `parts/` imports Preact and its signals, `boundary`'s types, its own
// words). In its place, a line; on the whole screen, «Saluta», which
// invokes its leaf `greet_a_bond` on `self` through its door, and how it
// went. A part acting at her tap here; the kernel cannot tell it from one
// acting by itself (EXT-16), and shows it as greetings' activity.
/**
 * Its look (K-3): a part draws its own `<style>`, in the layer of the
 * extensions, scoped by its class, with the design's variables, so that it
 * follows the theme (Roano, Lavagna) and the kernel's mark stays over it
 * (the layer `frame`, WEB-26). [Q, C, high impact: A to discuss]
 */
const its_look = `@layer extensions {
  .the-greetings { display: grid; gap: var(--space-2); justify-items: start; margin: 0; }
  .the-greetings button {
    min-block-size: var(--tap);
    padding: var(--space-2) var(--space-4);
    border: 2px solid var(--extension-edge);
    border-radius: var(--radius-round);
    background: var(--extension-raised);
    color: var(--extension-ink);
    font: inherit;
    font-weight: var(--weight-strong);
  }
  .the-greetings button:disabled { opacity: 0.6; }
  .the-greetings [role='status'] { margin: 0; color: var(--ink-soft); }
}`;
/** The bond the part is told, on a bond's screen or on its row; none on the extension's own. */
const the_bond_of = (placed) => placed.place === 'the_extension' ? undefined : placed.data.bond;
/** Its leaf asked through the door, and how it went by what it was told: sent on `the_greeting_is_sent`, else not sent. */
const greets = async (door, bond) => {
    for await (const told of door.invoke({
        use_case: 'usecase/greet_a_bond',
        version: '1.0.0',
        input: { bond },
    })) {
        if (told.told === 'an_event' && told.event.event === 'the_greeting_is_sent')
            return 'sent';
    }
    return 'not_sent';
};
export const part = (given) => {
    const went = useSignal('nothing_yet');
    const bond = the_bond_of(given.placed);
    if (given.where === 'in_its_place')
        return (_jsxs(_Fragment, { children: [_jsx("style", { children: its_look }), _jsx("p", { class: "the-greetings", "data-state": went.value, children: went.value === 'nothing_yet' ? words.in_its_place : words.how_it_went[went.value] })] }));
    return (_jsxs("div", { class: "the-greetings", "data-state": went.value, children: [_jsx("style", { children: its_look }), _jsx("button", { type: "button", disabled: bond === undefined || went.value === 'on_its_way', onClick: () => {
                    if (bond === undefined)
                        return;
                    went.value = 'on_its_way';
                    void greets(given.door, bond).then((how) => {
                        went.value = how;
                    });
                }, children: words.greet }), _jsx("p", { role: "status", children: words.how_it_went[went.value] })] }));
};

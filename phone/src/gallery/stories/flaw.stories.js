import { jsx as _jsx } from "preact/jsx-runtime";
// Flaw (WEB-27): a flaw declared, with its sign.
import { Flaw } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
export default { title: 'Design/Flaw', component: Flaw };
export const a_flaw_declared = {
    render: () => _jsx(Flaw, { title: words.a_flaw_title, children: words.the_storage }),
};

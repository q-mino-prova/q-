import { jsx as _jsx } from "preact/jsx-runtime";
// Notice (WEB-27): each kind it tells.
import { Notice } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
export default { title: 'Design/Notice', component: Notice };
export const information = {
    render: () => _jsx(Notice, { kind: "information", children: words.no_answer }),
};
export const waiting = {
    render: () => _jsx(Notice, { kind: "waiting", children: words.waiting }),
};
export const done = {
    render: () => _jsx(Notice, { kind: "done", children: words.done }),
};
export const a_fault = {
    render: () => _jsx(Notice, { kind: "fault", children: words.something_went_wrong }),
};

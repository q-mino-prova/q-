import { jsx as _jsx } from "preact/jsx-runtime";
// Why (WEB-27): the reason of a fault, folded under «Perché», and open.
import { Why } from '@q-mino/adapters-web/design';
import { texts } from "../../texts/index.js";
const the_message = 'IndexedDB: the database "q-" is at version 3, this release reads version 2';
export default { title: 'Design/Why', component: Why };
export const folded = {
    render: () => _jsx(Why, { title: texts.start.why, message: the_message }),
};

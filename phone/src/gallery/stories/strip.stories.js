import { jsx as _jsx } from "preact/jsx-runtime";
// Strip (WEB-27): what the phone tells of the network, over every screen.
import { Strip } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
export default { title: 'Design/Strip', component: Strip };
export const no_network = {
    render: () => _jsx(Strip, { glyph: "wifi_off", children: words.no_network }),
};
export const the_relay_does_not_answer = {
    render: () => _jsx(Strip, { glyph: "clock", children: words.the_relay_does_not_answer }),
};
export const the_relay_is_full = {
    render: () => _jsx(Strip, { glyph: "circle_alert", children: words.the_relay_is_full }),
};

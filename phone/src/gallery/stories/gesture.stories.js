import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// Gesture (WEB-27): each kind, with a glyph, off, and the gestures of a screen together.
import { Gesture } from '@q-mino/adapters-web/design';
import { the_gallery } from "../../texts/index.js";
const words = the_gallery.samples;
const nothing = { does: 'taps', taps: () => undefined };
export default { title: 'Design/Gesture', component: Gesture };
export const a_primary_gesture = {
    render: () => _jsx(Gesture, { kind: "primary", label: words.give_the_name, does: nothing }),
};
export const a_secondary_gesture = {
    render: () => _jsx(Gesture, { kind: "secondary", label: words.rename_it, glyph: "pencil", does: nothing }),
};
export const a_quiet_gesture = {
    render: () => _jsx(Gesture, { kind: "quiet", label: words.back, glyph: "arrow_left", does: nothing }),
};
export const a_dangerous_gesture = {
    render: () => _jsx(Gesture, { kind: "dangerous", label: words.remove_it, glyph: "trash_2", does: nothing }),
};
export const a_gesture_off = {
    render: () => _jsx(Gesture, { kind: "primary", label: words.in_progress, does: nothing, off: true }),
};
export const the_gestures_of_a_screen = {
    render: () => (_jsxs("p", { class: "gallery-row", children: [_jsx(Gesture, { kind: "primary", label: words.give_the_name, does: nothing }), _jsx(Gesture, { kind: "secondary", label: words.stop_renaming, does: nothing }), _jsx(Gesture, { kind: "dangerous", label: words.remove_it, glyph: "trash_2", does: nothing })] })),
};

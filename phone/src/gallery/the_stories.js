// The files of stories the gallery shows (WEB-28), in its order: the
// tokens, then each component of the design (WEB-27), then each screen
// (WEB-29).
import { the_file_of } from "./a_story.js";
import * as field from "./stories/field.stories.js";
import * as flaw from "./stories/flaw.stories.js";
import * as gesture from "./stories/gesture.stories.js";
import * as icon from "./stories/icon.stories.js";
import * as list from "./stories/list.stories.js";
import * as notice from "./stories/notice.stories.js";
import * as screen from "./stories/screen.stories.js";
import * as strip from "./stories/strip.stories.js";
import * as tokens from "./stories/tokens.stories.js";
import * as card from "./stories/card.stories.js";
import * as menu from "./stories/menu.stories.js";
import * as question from "./stories/question.stories.js";
import * as qr from "./stories/qr.stories.js";
import * as why from "./stories/why.stories.js";
import * as mark from "./stories/mark.stories.js";
import * as slot from "./stories/slot.stories.js";
import * as the_app from "./stories/screens/the_app.stories.js";
import * as the_first_face from "./stories/screens/the_first_face.stories.js";
import * as the_server from "./stories/screens/the_server.stories.js";
import * as the_introduction from "./stories/screens/the_introduction.stories.js";
import * as my_contacts from "./stories/screens/my_contacts.stories.js";
import * as a_contact from "./stories/screens/a_contact.stories.js";
import * as the_chat from "./stories/screens/the_chat.stories.js";
import * as the_handshake_in_person from "./stories/screens/the_handshake_in_person.stories.js";
import * as the_handshake_at_a_distance from "./stories/screens/the_handshake_at_a_distance.stories.js";
import * as an_invitation from "./stories/screens/an_invitation.stories.js";
import * as the_extensions from "./stories/screens/the_extensions.stories.js";
import * as an_extension from "./stories/screens/an_extension.stories.js";
import * as a_page from "./stories/screens/a_page.stories.js";
import * as what_happened from "./stories/screens/what_happened.stories.js";
import * as the_strip from "./stories/screens/the_strip.stories.js";
/** The screens (WEB-29), after the components. */
const the_screens = [
    the_app,
    the_first_face,
    the_introduction,
    the_server,
    my_contacts,
    a_contact,
    the_chat,
    the_handshake_in_person,
    the_handshake_at_a_distance,
    an_invitation,
    the_extensions,
    an_extension,
    a_page,
    what_happened,
    the_strip,
];
export const the_files = [
    tokens,
    icon,
    gesture,
    notice,
    flaw,
    strip,
    list,
    field,
    card,
    menu,
    question,
    qr,
    why,
    mark,
    slot,
    screen,
    ...the_screens,
].map(the_file_of);

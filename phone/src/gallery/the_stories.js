// The files of stories the gallery shows (WEB-28), in its order: the
// tokens, then each component of the design (WEB-27).
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
export const the_files = [tokens, icon, gesture, notice, flaw, strip, list, field, screen].map(the_file_of);

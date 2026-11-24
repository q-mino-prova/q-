import { template as _$template } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<p>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<section><h1>`);
// A page of an extension (UI-4, UI-5; EXT-16; story 22 of `ui`'s README):
// its name in the kernel's mark of its extension, where its frame is placed
// while the place still draws it; withdrawn or deactivated meanwhile, no
// longer there. What it shows is not drawn yet (`APartNotDrawn`, WEB-23).
import * as a_page from '@q-mino/domains/ui/a_page/_dsl.ts';
import { createMemo, Match, Switch, untrack } from 'solid-js';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { APartNotDrawn, Back, TheMark } from "./parts.js";
import { the_app } from "./the_app.js";
export const APage = props => {
  const app = the_app();
  const opened = untrack(() => props.screen);
  const screen = a_screen(app, {
    at_the_start: () => a_page.at_the_start(opened),
    after: a_page.after
  });
  const given = what_it_is_given(app, screen.state, async () => {
    const [extensions, offers] = await Promise.all([app.node.the_extensions(), app.node.the_offers()]);
    return {
      extensions: [...extensions],
      offers
    };
  });
  const shown = createMemo(() => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : a_page.what_it_shows(state, read.given);
  });
  const the_frame = () => {
    const it = shown();
    return it?.shows === 'the_frame' ? it : undefined;
  };
  return (() => {
    var _el$ = _tmpl$2(),
      _el$2 = _el$.firstChild;
    _$insert(_el$, _$createComponent(Back, {
      onBack: () => {
        screen.happens({
          happens: 'she_goes_back'
        });
      }
    }), _el$2);
    _$insert(_el$2, () => props.texts.title);
    _$insert(_el$, _$createComponent(Switch, {
      get children() {
        return [_$createComponent(Match, {
          get when() {
            return shown()?.shows === 'no_longer_there';
          },
          get children() {
            var _el$3 = _tmpl$();
            _$insert(_el$3, () => props.texts.no_longer_there);
            return _el$3;
          }
        }), _$createComponent(Match, {
          get when() {
            return the_frame();
          },
          children: frame => _$createComponent(TheMark, {
            get extension() {
              return frame().extension;
            },
            get children() {
              return _$createComponent(APartNotDrawn, {});
            }
          })
        })];
      }
    }), null);
    _$effect(() => _$setAttribute(_el$, "aria-label", props.texts.title));
    return _el$;
  })();
};
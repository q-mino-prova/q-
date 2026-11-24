import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<section><h1>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<ul>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<p>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<li><button type=button></button> <small></small> <small>`);
// The extensions installed (UI-5; EXT-7, EXT-10): each by its name, with its
// version and whether it is active, not active, or waiting for her to
// accept a new manifest; each opens its own screen.
import * as the_extensions from '@q-mino/domains/ui/the_extensions/_dsl.ts';
import { createMemo, For, Show } from 'solid-js';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { Back } from "./parts.js";
import { the_app, the_word_or_its_fault } from "./the_app.js";
export const TheExtensions = props => {
  const app = the_app();
  const screen = a_screen(app, {
    at_the_start: the_extensions.at_the_start,
    after: the_extensions.after
  });
  const given = what_it_is_given(app, screen.state, () => app.node.the_extensions());
  const shown = createMemo(() => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : the_extensions.what_it_shows(state, read.given);
  });
  return (() => {
    var _el$ = _tmpl$(),
      _el$2 = _el$.firstChild;
    _$insert(_el$, _$createComponent(Back, {
      onBack: () => {
        screen.happens({
          happens: 'she_goes_back'
        });
      }
    }), _el$2);
    _$insert(_el$2, () => props.texts.title);
    _$insert(_el$, _$createComponent(Show, {
      get when() {
        return shown();
      },
      children: it => _$createComponent(Show, {
        get when() {
          return it().extensions.length > 0;
        },
        get fallback() {
          return (() => {
            var _el$4 = _tmpl$3();
            _$insert(_el$4, () => props.texts.none);
            return _el$4;
          })();
        },
        get children() {
          var _el$3 = _tmpl$2();
          _$insert(_el$3, _$createComponent(For, {
            get each() {
              return it().extensions;
            },
            children: one => (() => {
              var _el$5 = _tmpl$4(),
                _el$6 = _el$5.firstChild,
                _el$7 = _el$6.nextSibling,
                _el$8 = _el$7.nextSibling,
                _el$9 = _el$8.nextSibling,
                _el$0 = _el$9.nextSibling;
              _el$6.$$click = () => {
                screen.happens({
                  happens: 'she_opens_an_extension',
                  extension: one.extension
                });
              };
              _$insert(_el$6, () => the_word_or_its_fault(app.common, app.words(one.extension)?.name, one.extension));
              _$insert(_el$8, () => props.texts.the_version(one.version));
              _$insert(_el$0, () => props.texts.is[one.is]);
              return _el$5;
            })()
          }));
          return _el$3;
        }
      })
    }), null);
    _$effect(() => _$setAttribute(_el$, "aria-label", props.texts.title));
    return _el$;
  })();
};
_$delegateEvents(["click"]);
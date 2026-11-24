import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { memo as _$memo } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<section><h1>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<form><label> <input name=name></label><button type=submit>`);
// The first face (UI-5, 1a): her name, kept as a draft as she types it; the
// button off with no name, making while the face is made.
import * as the_first_face from '@q-mino/domains/ui/the_first_face/_dsl.ts';
import { Show } from 'solid-js';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { TheCourse } from "./parts.js";
import { the_app, what_it_asked_now } from "./the_app.js";
export const TheFirstFace = props => {
  const app = the_app();
  const screen = a_screen(app, {
    at_the_start: async () => the_first_face.at_the_start(await app.node.a_draft({
      for: 'the_name_of_my_first_face'
    })),
    after: the_first_face.after,
    told_the_end: ended => ended
  });
  const given = what_it_is_given(app, screen.state, async state => state.asked === undefined ? undefined : app.node.an_activity(state.asked.asked.activity_id));
  const shown = () => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : the_first_face.what_it_shows(state, read.given);
  };
  return (() => {
    var _el$ = _tmpl$(),
      _el$2 = _el$.firstChild;
    _$insert(_el$2, () => props.texts.title);
    _$insert(_el$, _$createComponent(Show, {
      get when() {
        return shown();
      },
      children: it => (() => {
        var _el$3 = _tmpl$2(),
          _el$4 = _el$3.firstChild,
          _el$5 = _el$4.firstChild,
          _el$6 = _el$5.nextSibling,
          _el$7 = _el$4.nextSibling;
        _el$3.addEventListener("submit", event => {
          event.preventDefault();
          screen.happens({
            happens: 'she_makes_the_face',
            asked: what_it_asked_now(app.device),
            face: app.device.draws_an_id()
          });
        });
        _$insert(_el$4, () => props.texts.your_name, _el$5);
        _el$6.$$input = event => {
          screen.happens({
            happens: 'she_types_the_name',
            name: event.currentTarget.value
          });
        };
        _$insert(_el$7, (() => {
          var _c$ = _$memo(() => it().the_button === 'making');
          return () => _c$() ? props.texts.making : props.texts.make_it;
        })());
        _$insert(_el$3, _$createComponent(TheCourse, {
          get course() {
            return it().course;
          }
        }), null);
        _$effect(() => _el$7.disabled = it().the_button !== 'on');
        _$effect(() => _el$6.value = it().name);
        return _el$3;
      })()
    }), null);
    _$effect(() => _$setAttribute(_el$, "aria-label", props.texts.title));
    return _el$;
  })();
};
_$delegateEvents(["input"]);
import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<section><h1>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<p>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<button type=button>`);
// The server (UI-5; 1c of the notes on screens): informative, no choice. The
// relay of the configuration her letters go through, what it declares, what
// it sees and what it does not; shown once after her first face, read again
// from the menu; she goes on, to the start.
import * as the_server from '@q-mino/domains/ui/the_server/_dsl.ts';
import { createMemo, Show } from 'solid-js';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { the_app } from "./the_app.js";
export const TheServer = props => {
  const app = the_app();
  const screen = a_screen(app, {
    at_the_start: the_server.at_the_start,
    after: the_server.after
  });
  const given = what_it_is_given(app, screen.state, async () => ({
    relay: (await app.node.the_relay()).address
  }));
  const shown = createMemo(() => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : the_server.what_it_shows(state, read.given);
  });
  return (() => {
    var _el$ = _tmpl$(),
      _el$2 = _el$.firstChild;
    _$insert(_el$2, () => props.texts.title);
    _$insert(_el$, _$createComponent(Show, {
      get when() {
        return shown();
      },
      children: it => [(() => {
        var _el$3 = _tmpl$2();
        _$insert(_el$3, () => props.texts.it_carries_your_letters(it().relay));
        return _el$3;
      })(), (() => {
        var _el$4 = _tmpl$2();
        _$insert(_el$4, () => props.texts.it_sees);
        return _el$4;
      })(), (() => {
        var _el$5 = _tmpl$2();
        _$insert(_el$5, () => props.texts.it_does_not_see);
        return _el$5;
      })(), (() => {
        var _el$6 = _tmpl$2();
        _$insert(_el$6, () => props.texts.it_is_told_not_guaranteed);
        return _el$6;
      })(), (() => {
        var _el$7 = _tmpl$3();
        _el$7.$$click = () => {
          screen.happens({
            happens: 'she_goes_on'
          });
        };
        _$insert(_el$7, () => props.texts.go_on);
        return _el$7;
      })()]
    }), null);
    _$effect(() => _$setAttribute(_el$, "aria-label", props.texts.title));
    return _el$;
  })();
};
_$delegateEvents(["click"]);
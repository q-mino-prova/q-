import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { style as _$style } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { memo as _$memo } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<p role=status>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<button type=button>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<section><h2>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<ul>`),
  _tmpl$5 = /*#__PURE__*/_$template(`<small role=status>`),
  _tmpl$6 = /*#__PURE__*/_$template(`<p><button type=button></button> `),
  _tmpl$7 = /*#__PURE__*/_$template(`<li><button type=button>`),
  _tmpl$8 = /*#__PURE__*/_$template(`<p role=alert>`);
// The parts the screens share (UI-1, UI-3, UI-4): the course of what a
// screen asked, told; the gesture back; since part 22.2 the kernel's mark of
// an extension and the points it holds at a place (EXT-16, WEB-22).
import * as ui from '@q-mino/domains/ui/_dsl.ts';
import { For, Match, Show, Switch } from 'solid-js';
import { in_its_words, the_app, the_word_or_its_fault, the_words_of_an_actions_end, the_words_of_an_end } from "./the_app.js";
/** The course of what a screen asked: nothing, in progress, or how it ended, in her words. */
export const TheCourse = props => {
  const app = the_app();
  return _$createComponent(Switch, {
    get children() {
      return [_$createComponent(Match, {
        get when() {
          return props.course.course === 'in_progress';
        },
        get children() {
          var _el$ = _tmpl$();
          _$insert(_el$, () => app.common.in_progress);
          return _el$;
        }
      }), _$createComponent(Match, {
        get when() {
          return _$memo(() => props.course.course === 'ended')() ? props.course : undefined;
        },
        children: ended => (() => {
          var _el$2 = _tmpl$();
          _$insert(_el$2, () => the_words_of_an_end(app.common, ended().how));
          return _el$2;
        })()
      })];
    }
  });
};
/** The gesture back. */
export const Back = props => {
  const app = the_app();
  return (() => {
    var _el$3 = _tmpl$2();
    _el$3.$$click = () => {
      props.onBack();
    };
    _$insert(_el$3, () => app.common.back);
    return _el$3;
  })();
};
/** The kernel's mark of an extension around what it holds (EXT-16): its name and a border. */
export const the_marks_style = {
  border: '2px solid',
  padding: '0.5em',
  margin: '0.5em 0'
};
/**
 * The kernel's mark of an extension (EXT-16): a section with its name, from
 * its words, and a border, around what it holds; a name the app does not
 * have, drawn as a fault (WEB-22).
 */
export const TheMark = props => {
  const app = the_app();
  const title = () => in_its_words(app.common, app.words(props.extension)?.name, props.extension, app.common.the_mark_of);
  return (() => {
    var _el$4 = _tmpl$3(),
      _el$5 = _el$4.firstChild;
    _$insert(_el$5, title);
    _$insert(_el$4, () => props.children, null);
    _$effect(_p$ => {
      var _v$ = title(),
        _v$2 = the_marks_style;
      _v$ !== _p$.e && _$setAttribute(_el$4, "aria-label", _p$.e = _v$);
      _p$.t = _$style(_el$4, _v$2, _p$.t);
      return _p$;
    }, {
      e: undefined,
      t: undefined
    });
    return _el$4;
  })();
};
/** A course ended, or none. */
const an_end = course => course.course === 'ended' ? course : undefined;
/**
 * The points a mark holds at its place (UI-4, EXT-16, WEB-22): each action,
 * a gesture the kernel draws with the extension's label, off while its
 * activity is in progress, and how it ended in the extension's words; each
 * slot, what the app does not draw yet (`APartNotDrawn`); each page, the
 * gesture that opens it, by its label. A word the extension's words lack is
 * drawn as a fault, never silently its name.
 */
export const ThePoints = props => {
  const app = the_app();
  const words = () => app.words(props.mark.extension);
  return [_$createComponent(For, {
    get each() {
      return props.mark.actions;
    },
    children: action => (() => {
      var _el$7 = _tmpl$6(),
        _el$8 = _el$7.firstChild,
        _el$9 = _el$8.nextSibling;
      _el$8.$$click = () => {
        props.taps(action);
      };
      _$insert(_el$8, () => the_word_or_its_fault(app.common, words()?.actions[action], action));
      _$insert(_el$7, _$createComponent(Switch, {
        get children() {
          return [_$createComponent(Match, {
            get when() {
              return props.course_of(action).course === 'in_progress';
            },
            get children() {
              var _el$0 = _tmpl$5();
              _$insert(_el$0, () => app.common.in_progress);
              return _el$0;
            }
          }), _$createComponent(Match, {
            get when() {
              return an_end(props.course_of(action));
            },
            children: ended => (() => {
              var _el$1 = _tmpl$5();
              _$insert(_el$1, () => the_words_of_an_actions_end(app.common, words(), ended().how));
              return _el$1;
            })()
          })];
        }
      }), null);
      _$effect(() => _el$8.disabled = !ui.it_may_ask(props.course_of(action)));
      return _el$7;
    })()
  }), _$createComponent(For, {
    get each() {
      return props.mark.slots;
    },
    children: () => _$createComponent(APartNotDrawn, {})
  }), _$createComponent(Show, {
    get when() {
      return props.mark.pages.length > 0;
    },
    get children() {
      var _el$6 = _tmpl$4();
      _$insert(_el$6, _$createComponent(For, {
        get each() {
          return props.mark.pages;
        },
        children: page => (() => {
          var _el$10 = _tmpl$7(),
            _el$11 = _el$10.firstChild;
          _el$11.$$click = () => {
            props.opens(page);
          };
          _$insert(_el$11, () => in_its_words(app.common, words()?.pages[page], page, app.common.the_points.opens_the_page));
          return _el$10;
        })()
      }));
      return _el$6;
    }
  })];
};
/**
 * A slot or a page of an extension, in its mark (EXT-16, WEB-23): a
 * component of the extension's in the kernel's frame, deferred until an
 * extension the app carries has one (ping pong has none). Until then the
 * app tells it does not have it, a fault of its composition, never a blank.
 * [Q, C, 24 Nov 2026]
 */
export const APartNotDrawn = () => {
  const app = the_app();
  return (() => {
    var _el$12 = _tmpl$8();
    _$insert(_el$12, () => app.common.the_points.no_document);
    return _el$12;
  })();
};
_$delegateEvents(["click"]);
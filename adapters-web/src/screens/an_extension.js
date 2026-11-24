import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<p>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<section><h1>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<h2>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<p><small></small> <small>`),
  _tmpl$5 = /*#__PURE__*/_$template(`<button type=button>`),
  _tmpl$6 = /*#__PURE__*/_$template(`<section><ol></ol><button type=button></button><button type=button>`),
  _tmpl$7 = /*#__PURE__*/_$template(`<h3>`),
  _tmpl$8 = /*#__PURE__*/_$template(`<li>`);
// An extension's own screen (UI-5; EXT-7, EXT-16, USR-7, USR-8; stories
// 19–21 of `ui`'s README): its name, version and state; to activate it, the
// notice of what it asks, the flaws the kernel cannot fence included, and
// the manifest she was shown accepted or not; a new manifest accepted the
// same way; deactivating it. In the kernel's mark of it, its letters held
// and what happened to it, and since part 22.2 the points of its place
// (WEB-22): its actions, its slots, the pages it opens.
import * as an_extension from '@q-mino/domains/ui/an_extension/_dsl.ts';
import { createMemo, For, Match, Show, Switch, untrack } from 'solid-js';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { Back, TheCourse, TheMark, ThePoints } from "./parts.js";
import { in_its_words, the_app, the_word_or_its_fault, what_it_asked_now } from "./the_app.js";
import { TheNews } from "./what_happened.js";
/** The plural of a point, as an extension's words name its labels (EXT-16). */
const the_labels_of = {
  action: 'actions',
  slot: 'slots',
  page: 'pages'
};
/** What an extension asks, in her words: a place by its label in the extension's words, or the fault of its missing (WEB-22). */
const the_words_of_what_it_asks = (texts, common, words, asks) => {
  switch (asks.asks) {
    case 'to_answer_your_bonds':
      return texts.to_answer_your_bonds(asks.leaves);
    case 'a_place_on_your_screens':
      return in_its_words(common, words?.[the_labels_of[asks.point]][asks.name], asks.name, label => texts.a_place_on_your_screens[asks.point](label, asks.place));
    case 'to_see_the_peers_key':
    case 'to_see_the_name_of_the_bond':
    case 'to_send_requests_on_your_bonds':
    case 'a_storage_of_its_own':
    case 'all_that_cumino_reaches':
    case 'its_frames_act_with_no_tap':
      return texts.what_it_asks[asks.asks];
  }
};
const nothing_asked = {
  course: 'nothing_asked'
};
/** The course of its activation or deactivation, the last she asked. */
/** The course of the last activity of an action of its mark (UI-3). */
const the_course_of_an_action = (shown, action) => shown.courses.filter(one => one.for.for === 'an_action' && one.for.action === action).at(-1)?.course ?? nothing_asked;
const the_course_of_its_state = shown => shown.courses.filter(one => one.for.for === 'activating' || one.for.for === 'deactivating').at(-1)?.course ?? nothing_asked;
export const AnExtension = props => {
  const app = the_app();
  const extension = untrack(() => props.screen.extension);
  const screen = a_screen(app, {
    at_the_start: () => an_extension.at_the_start(extension),
    after: an_extension.after,
    told_the_end: ended => ended
  });
  const given = what_it_is_given(app, screen.state, async state => {
    const [extensions, held_letters, happened, activities] = await Promise.all([app.node.the_extensions(), app.node.the_held_letters(), app.node.what_happened(), Promise.all(state.asked.map(one => app.node.an_activity(one.asked.activity_id)))]);
    return {
      extension: extensions.find(one => one.extension === state.extension),
      held_letters: [...held_letters],
      happened: [...happened],
      activities: activities.filter(card => card !== undefined)
    };
  });
  const shown = createMemo(() => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : an_extension.what_it_shows(state, read.given);
  });
  const the_extension = () => {
    const it = shown();
    return it?.shows === 'the_extension' ? it : undefined;
  };
  /** The manifest she is shown: the one of the extension read, whose notice the screen tells. */
  const the_manifest = () => given()?.given.extension?.manifest;
  const may = it => {
    switch (it.may) {
      case 'activate':
      case 'accept_the_new_manifest':
        screen.happens({
          happens: 'she_asks_to_activate_it'
        });
        return;
      case 'deactivate':
        screen.happens({
          happens: 'she_deactivates_it',
          asked: what_it_asked_now(app.device)
        });
        return;
      case 'wait':
        return;
    }
  };
  const accepts = () => {
    const manifest = the_manifest();
    if (manifest === undefined) return;
    screen.happens({
      happens: 'she_accepts',
      manifest,
      asked: what_it_asked_now(app.device)
    });
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
            return shown()?.shows === 'no_such_extension';
          },
          get children() {
            var _el$3 = _tmpl$();
            _$insert(_el$3, () => props.texts.no_such_extension);
            return _el$3;
          }
        }), _$createComponent(Match, {
          get when() {
            return the_extension();
          },
          children: it => [(() => {
            var _el$4 = _tmpl$3();
            _$insert(_el$4, () => the_word_or_its_fault(app.common, app.words(it().extension)?.name, it().extension));
            return _el$4;
          })(), (() => {
            var _el$5 = _tmpl$4(),
              _el$6 = _el$5.firstChild,
              _el$7 = _el$6.nextSibling,
              _el$8 = _el$7.nextSibling;
            _$insert(_el$6, () => props.texts.the_version(it().version));
            _$insert(_el$8, () => props.texts.is[it().is]);
            return _el$5;
          })(), (() => {
            var _el$9 = _tmpl$5();
            _el$9.$$click = () => {
              may(it());
            };
            _$insert(_el$9, () => props.texts.may[it().may]);
            _$effect(() => _el$9.disabled = it().may === 'wait');
            return _el$9;
          })(), _$createComponent(TheCourse, {
            get course() {
              return the_course_of_its_state(it());
            }
          }), _$createComponent(Show, {
            get when() {
              return it().the_notice;
            },
            children: notice => (() => {
              var _el$0 = _tmpl$6(),
                _el$1 = _el$0.firstChild,
                _el$10 = _el$1.nextSibling,
                _el$11 = _el$10.nextSibling;
              _$insert(_el$0, _$createComponent(Show, {
                get when() {
                  return the_manifest();
                },
                children: manifest => (() => {
                  var _el$12 = _tmpl$7();
                  _$insert(_el$12, () => in_its_words(app.common, app.words(manifest().name)?.name, manifest().name, name => props.texts.the_notice(name, manifest().version)));
                  return _el$12;
                })()
              }), _el$1);
              _$insert(_el$1, _$createComponent(For, {
                get each() {
                  return notice();
                },
                children: asks => (() => {
                  var _el$13 = _tmpl$8();
                  _$insert(_el$13, () => the_words_of_what_it_asks(props.texts, app.common, app.words(it().extension), asks));
                  return _el$13;
                })()
              }));
              _el$10.$$click = accepts;
              _$insert(_el$10, () => props.texts.accept);
              _el$11.$$click = () => {
                screen.happens({
                  happens: 'she_does_not_accept'
                });
              };
              _$insert(_el$11, () => props.texts.do_not_accept);
              return _el$0;
            })()
          }), _$createComponent(TheMark, {
            get extension() {
              return it().extension;
            },
            get children() {
              return [_$createComponent(Show, {
                get when() {
                  return it().mark.points;
                },
                children: points => _$createComponent(ThePoints, {
                  get mark() {
                    return points();
                  },
                  course_of: action => the_course_of_an_action(it(), action),
                  taps: action => {
                    screen.happens({
                      happens: 'she_taps_an_action',
                      mark: points(),
                      action,
                      asked: what_it_asked_now(app.device)
                    });
                  },
                  opens: page => {
                    screen.happens({
                      happens: 'she_opens_a_page',
                      mark: points(),
                      page
                    });
                  }
                })
              }), _$createComponent(Show, {
                get when() {
                  return it().mark.held_letters.length + it().mark.happened.length > 0;
                },
                get fallback() {
                  return (() => {
                    var _el$14 = _tmpl$();
                    _$insert(_el$14, () => props.texts.no_news);
                    return _el$14;
                  })();
                },
                get children() {
                  return _$createComponent(TheNews, {
                    get texts() {
                      return props.texts.the_news;
                    },
                    get held_letters() {
                      return it().mark.held_letters;
                    },
                    get happened() {
                      return it().mark.happened;
                    },
                    sends_again: held => {
                      screen.happens({
                        happens: 'she_sends_a_letter_again',
                        held,
                        asked: what_it_asked_now(app.device)
                      });
                    },
                    puts_aside: (held, because) => {
                      screen.happens({
                        happens: 'she_puts_a_letter_aside',
                        held,
                        because,
                        asked: what_it_asked_now(app.device)
                      });
                    }
                  });
                }
              })];
            }
          })]
        })];
      }
    }), null);
    _$effect(() => _$setAttribute(_el$, "aria-label", props.texts.title));
    return _el$;
  })();
};
_$delegateEvents(["click"]);
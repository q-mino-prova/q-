import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<h3>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<ul>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<li><p></p><p><small></small></p><button type=button></button><form><label> <input name=because maxlength=1024></label><button type=submit>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<small> (<!>)`),
  _tmpl$5 = /*#__PURE__*/_$template(`<li>`),
  _tmpl$6 = /*#__PURE__*/_$template(`<p>`),
  _tmpl$7 = /*#__PURE__*/_$template(`<section><h1>`),
  _tmpl$8 = /*#__PURE__*/_$template(`<h2>`),
  _tmpl$9 = /*#__PURE__*/_$template(`<section><h2>`);
// What happened (UI-5; F6, USR-8: nothing happens in silence; story 23 of
// `ui`'s README): what is in progress, each told by what she asked; the
// letters held and what happened without a fact, the kernel's by
// themselves, each extension's in the kernel's mark of it (EXT-16). A held
// letter she sends again, or puts aside with her reason. The news of a mark
// are drawn by `TheNews`, which an extension's own screen draws too.
import * as ui from '@q-mino/domains/ui/_dsl.ts';
import * as what_happened from '@q-mino/domains/ui/what_happened/_dsl.ts';
import { createMemo, For, Match, Show, Switch } from 'solid-js';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { Back, TheCourse, TheMark } from "./parts.js";
import { the_app, what_it_asked_now } from "./the_app.js";
/** The detail of what happened, when its case has one. */
const the_detail = (texts, happened) => {
  switch (happened.happened) {
    case 'a_request_met_silence':
      return texts.the_silence_because[happened.because];
    case 'a_letter_was_refused':
      return happened.leaf === '' ? undefined : happened.leaf;
    case 'an_extension_fell':
      return texts.the_fall[happened.fall];
    case 'a_letter_could_not_be_opened':
    case 'a_response_came_unasked':
    case 'a_response_could_not_be_sent':
    case 'a_request_could_not_be_sent':
    case 'an_extension_did_what_it_does_not_declare':
    case 'a_request_was_not_answered':
      return undefined;
  }
};
/** What happened, in her words: its case, then its detail (as the end of an activity is told). */
export const the_words_of_what_happened = (texts, happened) => {
  const detail = the_detail(texts, happened);
  const told = texts.happened[happened.happened];
  return detail === undefined ? told : `${told}: ${detail}`;
};
/** The world's words of a letter that could not be delivered. */
const the_worlds_words = held => held.why.why === 'it_could_not_be_delivered' && held.why.because !== '' ? held.why.because : undefined;
/**
 * The news of the kernel or of a mark: its letters held, each sent again or
 * put aside with her reason, once at a time; what happened. The letters are
 * kept by their names, so that her reason, typed, stays while her node is
 * read again.
 */
export const TheNews = props => {
  const letters = createMemo(() => props.held_letters.map(one => one.held.letter));
  return [_$createComponent(Show, {
    get when() {
      return props.held_letters.length > 0;
    },
    get children() {
      return [(() => {
        var _el$ = _tmpl$();
        _$insert(_el$, () => props.texts.the_held_letters);
        return _el$;
      })(), (() => {
        var _el$2 = _tmpl$2();
        _$insert(_el$2, _$createComponent(For, {
          get each() {
            return letters();
          },
          children: letter => _$createComponent(Show, {
            get when() {
              return props.held_letters.find(one => one.held.letter === letter);
            },
            children: one => (() => {
              var _el$5 = _tmpl$3(),
                _el$6 = _el$5.firstChild,
                _el$7 = _el$6.nextSibling,
                _el$8 = _el$7.firstChild,
                _el$9 = _el$7.nextSibling,
                _el$0 = _el$9.nextSibling,
                _el$1 = _el$0.firstChild,
                _el$10 = _el$1.firstChild,
                _el$11 = _el$1.nextSibling;
              _$insert(_el$6, () => one().held.what);
              _$insert(_el$8, () => props.texts.why_it_is_held[one().held.why.why]);
              _$insert(_el$7, _$createComponent(Show, {
                get when() {
                  return the_worlds_words(one().held);
                },
                children: because => (() => {
                  var _el$12 = _tmpl$4(),
                    _el$13 = _el$12.firstChild,
                    _el$15 = _el$13.nextSibling,
                    _el$14 = _el$15.nextSibling;
                  _$insert(_el$12, because, _el$15);
                  return _el$12;
                })()
              }), null);
              _el$9.$$click = () => {
                props.sends_again(one().held);
              };
              _$insert(_el$9, () => props.texts.send_it_again);
              _el$0.addEventListener("submit", event => {
                event.preventDefault();
                const because = new FormData(event.currentTarget).get('because');
                props.puts_aside(one().held, typeof because === 'string' ? because : '');
              });
              _$insert(_el$1, () => props.texts.why_aside, _el$10);
              _$insert(_el$11, () => props.texts.put_it_aside);
              _$insert(_el$5, _$createComponent(TheCourse, {
                get course() {
                  return one().course;
                }
              }), null);
              _$effect(_p$ => {
                var _v$ = !ui.it_may_ask(one().course),
                  _v$2 = !ui.it_may_ask(one().course);
                _v$ !== _p$.e && (_el$9.disabled = _p$.e = _v$);
                _v$2 !== _p$.t && (_el$11.disabled = _p$.t = _v$2);
                return _p$;
              }, {
                e: undefined,
                t: undefined
              });
              return _el$5;
            })()
          })
        }));
        return _el$2;
      })()];
    }
  }), _$createComponent(Show, {
    get when() {
      return props.happened.length > 0;
    },
    get children() {
      return [(() => {
        var _el$3 = _tmpl$();
        _$insert(_el$3, () => props.texts.what_happened);
        return _el$3;
      })(), (() => {
        var _el$4 = _tmpl$2();
        _$insert(_el$4, _$createComponent(For, {
          get each() {
            return props.happened;
          },
          children: one => (() => {
            var _el$16 = _tmpl$5();
            _$insert(_el$16, () => the_words_of_what_happened(props.texts, one));
            return _el$16;
          })()
        }));
        return _el$4;
      })()];
    }
  })];
};
/** The activities a screen asked, as `user` reads them (none not read yet). */
const the_activities_asked = async (app, asked) => (await Promise.all(asked.map(one => app.node.an_activity(one.asked.activity_id)))).filter(card => card !== undefined);
export const WhatHappened = props => {
  const app = the_app();
  const screen = a_screen(app, {
    at_the_start: what_happened.at_the_start,
    after: what_happened.after,
    told_the_end: ended => ended
  });
  const given = what_it_is_given(app, screen.state, async state => {
    const [in_progress, held_letters, happened, activities] = await Promise.all([app.node.the_activities_in_progress(), app.node.the_held_letters(), app.node.what_happened(), the_activities_asked(app, state.asked)]);
    return {
      in_progress: [...in_progress],
      held_letters: [...held_letters],
      happened: [...happened],
      activities
    };
  });
  const shown = createMemo(() => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : what_happened.what_it_shows(state, read.given);
  });
  const the_news = () => {
    const it = shown();
    return it?.shows === 'what_happened' ? it : undefined;
  };
  // The marks kept by their extensions' names, as the letters by theirs.
  const the_marks = createMemo(() => the_news()?.in_their_marks.map(one => one.extension) ?? []);
  const sends_again = held => {
    screen.happens({
      happens: 'she_sends_a_letter_again',
      held,
      asked: what_it_asked_now(app.device)
    });
  };
  const puts_aside = (held, because) => {
    screen.happens({
      happens: 'she_puts_a_letter_aside',
      held,
      because,
      asked: what_it_asked_now(app.device)
    });
  };
  return (() => {
    var _el$17 = _tmpl$7(),
      _el$18 = _el$17.firstChild;
    _$insert(_el$17, _$createComponent(Back, {
      onBack: () => {
        screen.happens({
          happens: 'she_goes_back'
        });
      }
    }), _el$18);
    _$insert(_el$18, () => props.texts.title);
    _$insert(_el$17, _$createComponent(Switch, {
      get children() {
        return [_$createComponent(Match, {
          get when() {
            return shown()?.shows === 'nothing_happened';
          },
          get children() {
            var _el$19 = _tmpl$6();
            _$insert(_el$19, () => props.texts.nothing_happened);
            return _el$19;
          }
        }), _$createComponent(Match, {
          get when() {
            return the_news();
          },
          children: it => [_$createComponent(Show, {
            get when() {
              return it().in_progress.length > 0;
            },
            get children() {
              return [(() => {
                var _el$20 = _tmpl$8();
                _$insert(_el$20, () => props.texts.in_progress);
                return _el$20;
              })(), (() => {
                var _el$21 = _tmpl$2();
                _$insert(_el$21, _$createComponent(For, {
                  get each() {
                    return it().in_progress;
                  },
                  children: card => (() => {
                    var _el$24 = _tmpl$5();
                    _$insert(_el$24, () => props.texts.the_activities[card.what.activity]);
                    return _el$24;
                  })()
                }));
                return _el$21;
              })()];
            }
          }), _$createComponent(Show, {
            get when() {
              return it().the_kernels.held_letters.length + it().the_kernels.happened.length > 0;
            },
            get children() {
              var _el$22 = _tmpl$9(),
                _el$23 = _el$22.firstChild;
              _$insert(_el$23, () => props.texts.the_kernels);
              _$insert(_el$22, _$createComponent(TheNews, {
                get texts() {
                  return props.texts.the_news;
                },
                get held_letters() {
                  return it().the_kernels.held_letters;
                },
                get happened() {
                  return it().the_kernels.happened;
                },
                sends_again: sends_again,
                puts_aside: puts_aside
              }), null);
              _$effect(() => _$setAttribute(_el$22, "aria-label", props.texts.the_kernels));
              return _el$22;
            }
          }), _$createComponent(For, {
            get each() {
              return the_marks();
            },
            children: extension => _$createComponent(Show, {
              get when() {
                return it().in_their_marks.find(one => one.extension === extension);
              },
              children: mark => _$createComponent(TheMark, {
                extension: extension,
                get children() {
                  return _$createComponent(TheNews, {
                    get texts() {
                      return props.texts.the_news;
                    },
                    get held_letters() {
                      return mark().held_letters;
                    },
                    get happened() {
                      return mark().happened;
                    },
                    sends_again: sends_again,
                    puts_aside: puts_aside
                  });
                }
              })
            })
          })]
        })];
      }
    }), null);
    _$effect(() => _$setAttribute(_el$17, "aria-label", props.texts.title));
    return _el$17;
  })();
};
_$delegateEvents(["click"]);
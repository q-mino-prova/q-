import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { memo as _$memo } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<p>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<section><h1>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<h2>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<ul>`),
  _tmpl$5 = /*#__PURE__*/_$template(`<button type=button>`),
  _tmpl$6 = /*#__PURE__*/_$template(`<section><h2></h2><button type=button>`),
  _tmpl$7 = /*#__PURE__*/_$template(`<li>`),
  _tmpl$8 = /*#__PURE__*/_$template(`<form><label> <input name=name></label><button type=submit></button><button type=button>`),
  _tmpl$9 = /*#__PURE__*/_$template(`<li> <small></small> <button type=button>`),
  _tmpl$0 = /*#__PURE__*/_$template(`<p role=status>`);
// A contact (UI-5; stories 9–11 of `ui`'s README): the card of a bond, by
// the name she gives it and as it introduced itself when that differs, how
// they shook hands, whether it has her yet, the relays of its mailbox;
// renaming it, its name a draft (USR-5); removing it, confirmed; the
// extensions active, each offered to it or not (EXT-7); the question of the
// extensions in common (EXT-8); since part 22.2 the marks of its place, the
// points of each extension active and offered to it (WEB-22).
import * as ui from '@q-mino/domains/ui/_dsl.ts';
import * as a_contact from '@q-mino/domains/ui/a_contact/_dsl.ts';
import { createMemo, For, Match, Show, Switch, untrack } from 'solid-js';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { Back, TheCourse, TheMark, ThePoints } from "./parts.js";
import { the_app, the_word_or_its_fault, what_it_asked_now } from "./the_app.js";
/** What came back of the last question, in her words: nothing when none was asked. */
const the_words_of_the_answer = (texts, common, words, answer) => {
  switch (answer.answer) {
    case 'not_asked':
      return undefined;
    case 'waiting':
      return texts.the_answer.waiting;
    case 'in_common':
      return texts.the_answer.in_common(answer.extensions.map(one => the_word_or_its_fault(common, words(one)?.name, one)));
    case 'none_in_common':
      return texts.the_answer.none_in_common;
    case 'no_answer':
      return texts.the_answer.no_answer[answer.why];
  }
};
const nothing_asked = {
  course: 'nothing_asked'
};
/** The course of the last activity asked for this, as `what_it_shows` tells it. */
const the_course_for = (shown, purpose) => shown.courses.filter(one => JSON.stringify(one.for) === JSON.stringify(purpose)).at(-1)?.course ?? nothing_asked;
export const AContact = props => {
  const app = the_app();
  const bond = untrack(() => props.screen.bond);
  const screen = a_screen(app, {
    at_the_start: () => a_contact.at_the_start(bond),
    after: a_contact.after,
    told_the_end: ended => ended
  });
  const given = what_it_is_given(app, screen.state, async state => {
    const [card, extensions, offered, activities, in_common] = await Promise.all([app.node.a_contact(bond), app.node.the_extensions(), app.node.offered_to(bond), Promise.all(state.asked.map(one => app.node.an_activity(one.asked.activity_id))), app.node.the_extensions_in_common_with(bond)]);
    return {
      card,
      extensions: [...extensions],
      offered,
      activities: activities.filter(one => one !== undefined),
      in_common
    };
  });
  const shown = createMemo(() => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : a_contact.what_it_shows(state, read.given);
  });
  const the_contact = () => {
    const it = shown();
    return it?.shows === 'the_contact' ? it : undefined;
  };
  /** She starts renaming it: with her draft, if one is kept, or the name she gives it. */
  const starts_renaming = async name => {
    const draft = await app.node.a_draft({
      for: 'the_name_i_give_a_bond',
      bond
    });
    screen.happens({
      happens: 'she_starts_renaming',
      name: draft ?? name
    });
  };
  const on_the_offer = one => {
    switch (one.may) {
      case 'offer':
        screen.happens({
          happens: 'she_offers_an_extension',
          extension: one.extension,
          asked: what_it_asked_now(app.device)
        });
        return;
      case 'withdraw_the_offer':
        screen.happens({
          happens: 'she_withdraws_the_offer',
          extension: one.extension,
          asked: what_it_asked_now(app.device)
        });
        return;
      case 'wait':
        return;
    }
  };
  /** She asks it for the extensions in common, with those her node offers it, as read. */
  const asks_for_the_extensions_in_common = () => {
    const read = given();
    if (read === undefined) return;
    screen.happens({
      happens: 'she_asks_for_the_extensions_in_common',
      offered: read.given.offered,
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
            return shown()?.shows === 'no_such_contact';
          },
          get children() {
            var _el$3 = _tmpl$();
            _$insert(_el$3, () => props.texts.no_such_contact);
            return _el$3;
          }
        }), _$createComponent(Match, {
          get when() {
            return the_contact();
          },
          children: it => [(() => {
            var _el$4 = _tmpl$3();
            _$insert(_el$4, () => it().card.name);
            return _el$4;
          })(), _$createComponent(Show, {
            get when() {
              return it().card.introduced_as !== it().card.name;
            },
            get children() {
              var _el$5 = _tmpl$();
              _$insert(_el$5, () => props.texts.introduced_as(it().card.introduced_as));
              return _el$5;
            }
          }), (() => {
            var _el$6 = _tmpl$();
            _$insert(_el$6, () => props.texts.the_handshake[it().card.handshake.way](props.texts.when(it().card.handshake.at, app.device.clock.time_zone)));
            return _el$6;
          })(), (() => {
            var _el$7 = _tmpl$();
            _$insert(_el$7, () => props.texts.the_confirmation[it().card.confirmation.state]);
            return _el$7;
          })(), _$createComponent(Show, {
            get when() {
              return it().card.their_relays.length > 0;
            },
            get children() {
              return [(() => {
                var _el$8 = _tmpl$();
                _$insert(_el$8, () => props.texts.their_relays);
                return _el$8;
              })(), (() => {
                var _el$9 = _tmpl$4();
                _$insert(_el$9, _$createComponent(For, {
                  get each() {
                    return it().card.their_relays;
                  },
                  children: relay => (() => {
                    var _el$16 = _tmpl$7();
                    _$insert(_el$16, relay);
                    return _el$16;
                  })()
                }));
                return _el$9;
              })()];
            }
          }), _$createComponent(Show, {
            get when() {
              return it().renaming;
            },
            get fallback() {
              return (() => {
                var _el$17 = _tmpl$5();
                _el$17.$$click = () => {
                  void starts_renaming(it().card.name);
                };
                _$insert(_el$17, () => props.texts.rename_it);
                return _el$17;
              })();
            },
            children: renaming => (() => {
              var _el$18 = _tmpl$8(),
                _el$19 = _el$18.firstChild,
                _el$20 = _el$19.firstChild,
                _el$21 = _el$20.nextSibling,
                _el$22 = _el$19.nextSibling,
                _el$23 = _el$22.nextSibling;
              _el$18.addEventListener("submit", event => {
                event.preventDefault();
                screen.happens({
                  happens: 'she_renames_it',
                  asked: what_it_asked_now(app.device)
                });
              });
              _$insert(_el$19, () => props.texts.the_name, _el$20);
              _el$21.$$input = event => {
                screen.happens({
                  happens: 'she_types_the_name',
                  name: event.currentTarget.value
                });
              };
              _$insert(_el$22, (() => {
                var _c$ = _$memo(() => renaming().the_button === 'renaming');
                return () => _c$() ? props.texts.renaming : props.texts.give_the_name;
              })());
              _el$23.$$click = () => {
                screen.happens({
                  happens: 'she_stops_renaming'
                });
              };
              _$insert(_el$23, () => props.texts.stop_renaming);
              _$effect(() => _el$22.disabled = renaming().the_button !== 'on');
              _$effect(() => _el$21.value = renaming().name);
              return _el$18;
            })()
          }), _$createComponent(TheCourse, {
            get course() {
              return the_course_for(it(), {
                for: 'the_name'
              });
            }
          }), _$createComponent(Switch, {
            get children() {
              return [_$createComponent(Match, {
                get when() {
                  return it().removing === 'not_asked';
                },
                get children() {
                  var _el$0 = _tmpl$5();
                  _el$0.$$click = () => {
                    screen.happens({
                      happens: 'she_asks_to_remove_it'
                    });
                  };
                  _$insert(_el$0, () => props.texts.remove_it);
                  return _el$0;
                }
              }), _$createComponent(Match, {
                get when() {
                  return it().removing === 'to_confirm';
                },
                get children() {
                  return [(() => {
                    var _el$1 = _tmpl$();
                    _$insert(_el$1, () => props.texts.remove_it_really(it().card.name));
                    return _el$1;
                  })(), (() => {
                    var _el$10 = _tmpl$5();
                    _el$10.$$click = () => {
                      screen.happens({
                        happens: 'she_removes_it',
                        asked: what_it_asked_now(app.device)
                      });
                    };
                    _$insert(_el$10, () => props.texts.yes_remove_it);
                    return _el$10;
                  })(), (() => {
                    var _el$11 = _tmpl$5();
                    _el$11.$$click = () => {
                      screen.happens({
                        happens: 'she_keeps_it'
                      });
                    };
                    _$insert(_el$11, () => props.texts.keep_it);
                    return _el$11;
                  })()];
                }
              })];
            }
          }), _$createComponent(TheCourse, {
            get course() {
              return the_course_for(it(), {
                for: 'removing'
              });
            }
          }), (() => {
            var _el$12 = _tmpl$6(),
              _el$13 = _el$12.firstChild,
              _el$15 = _el$13.nextSibling;
            _$insert(_el$13, () => props.texts.the_extensions);
            _$insert(_el$12, _$createComponent(Show, {
              get when() {
                return it().the_extensions.length > 0;
              },
              get fallback() {
                return (() => {
                  var _el$24 = _tmpl$();
                  _$insert(_el$24, () => props.texts.no_extension_active);
                  return _el$24;
                })();
              },
              get children() {
                var _el$14 = _tmpl$4();
                _$insert(_el$14, _$createComponent(For, {
                  get each() {
                    return it().the_extensions;
                  },
                  children: one => (() => {
                    var _el$25 = _tmpl$9(),
                      _el$26 = _el$25.firstChild,
                      _el$27 = _el$26.nextSibling,
                      _el$28 = _el$27.nextSibling,
                      _el$29 = _el$28.nextSibling;
                    _$insert(_el$25, () => the_word_or_its_fault(app.common, app.words(one.extension)?.name, one.extension), _el$26);
                    _$insert(_el$27, (() => {
                      var _c$2 = _$memo(() => !!one.offered);
                      return () => _c$2() ? props.texts.offered : props.texts.not_offered;
                    })());
                    _el$29.$$click = () => {
                      on_the_offer(one);
                    };
                    _$insert(_el$29, () => props.texts.the_offer[one.may]);
                    _$insert(_el$25, _$createComponent(TheCourse, {
                      get course() {
                        return the_course_for(it(), {
                          for: 'the_offer',
                          extension: one.extension
                        });
                      }
                    }), null);
                    _$effect(() => _el$29.disabled = one.may === 'wait');
                    return _el$25;
                  })()
                }));
                return _el$14;
              }
            }), _el$15);
            _el$15.$$click = asks_for_the_extensions_in_common;
            _$insert(_el$15, () => props.texts.ask_for_the_extensions_in_common);
            _$insert(_el$12, _$createComponent(TheCourse, {
              get course() {
                return the_course_for(it(), {
                  for: 'the_extensions_in_common'
                });
              }
            }), null);
            _$insert(_el$12, _$createComponent(Show, {
              get when() {
                return the_words_of_the_answer(props.texts, app.common, app.words, it().in_common);
              },
              children: said => (() => {
                var _el$30 = _tmpl$0();
                _$insert(_el$30, said);
                return _el$30;
              })()
            }), null);
            _$effect(_p$ => {
              var _v$ = props.texts.the_extensions,
                _v$2 = !ui.it_may_ask(the_course_for(it(), {
                  for: 'the_extensions_in_common'
                }));
              _v$ !== _p$.e && _$setAttribute(_el$12, "aria-label", _p$.e = _v$);
              _v$2 !== _p$.t && (_el$15.disabled = _p$.t = _v$2);
              return _p$;
            }, {
              e: undefined,
              t: undefined
            });
            return _el$12;
          })(), _$createComponent(For, {
            get each() {
              return it().marks;
            },
            children: mark => _$createComponent(TheMark, {
              get extension() {
                return mark.extension;
              },
              get children() {
                return _$createComponent(ThePoints, {
                  mark: mark,
                  course_of: action => the_course_for(it(), {
                    for: 'an_action',
                    extension: mark.extension,
                    action
                  }),
                  taps: action => {
                    screen.happens({
                      happens: 'she_taps_an_action',
                      mark,
                      action,
                      asked: what_it_asked_now(app.device)
                    });
                  },
                  opens: page => {
                    screen.happens({
                      happens: 'she_opens_a_page',
                      mark,
                      page
                    });
                  }
                });
              }
            })
          })]
        })];
      }
    }), null);
    _$effect(() => _$setAttribute(_el$, "aria-label", props.texts.title));
    return _el$;
  })();
};
_$delegateEvents(["click", "input"]);
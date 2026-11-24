import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { memo as _$memo } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<button type=button>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<p>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<p role=status>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<section><h1>`),
  _tmpl$5 = /*#__PURE__*/_$template(`<label> <input name=link readonly>`);
// The handshake at a distance, from who invites (UI-5, WEB-1): the flaw told
// first; she makes a link, a ticket of hers for a bond to be; ready, the link,
// shared with the phone's share, or copied where the phone has none (WEB-18);
// one that cannot be prepared told, with how; again, another link, for
// another bond.
import * as the_handshake_at_a_distance from '@q-mino/domains/ui/the_handshake_at_a_distance/_dsl.ts';
import { Match, Show, Switch } from 'solid-js';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { Back } from "./parts.js";
import { the_app, the_words_of_an_end, what_it_asked_now } from "./the_app.js";
/** The gesture that makes a link, in the words of where it is. */
const MakeALink = props => (() => {
  var _el$ = _tmpl$();
  _el$.$$click = () => {
    props.makes();
  };
  _$insert(_el$, () => props.words);
  return _el$;
})();
export const TheHandshakeAtADistance = props => {
  const app = the_app();
  const screen = a_screen(app, {
    at_the_start: the_handshake_at_a_distance.at_the_start,
    after: the_handshake_at_a_distance.after,
    told_the_end: ended => ended
  });
  const the_phone = app.device.the_navigator.share === undefined ? 'copies' : 'shares';
  const given = what_it_is_given(app, screen.state, async state => {
    if (state.ticket === undefined) return {
      model: {
        the_phone
      },
      link: undefined
    };
    const [her_ticket, activity] = await Promise.all([app.node.her_ticket(state.ticket.bond), app.node.an_activity(state.ticket.asked.activity_id)]);
    const model = {
      ...(her_ticket === undefined ? {} : {
        ticket: her_ticket.ready
      }),
      ...(activity === undefined ? {} : {
        activity
      }),
      the_phone
    };
    return {
      model,
      link: her_ticket?.link
    };
  });
  const shown = () => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : the_handshake_at_a_distance.what_it_shows(state, read.given.model);
  };
  const cannot_be_prepared = () => {
    const it = shown();
    return it?.shows === 'the_link_cannot_be_prepared' ? it : undefined;
  };
  const the_link = () => shown()?.shows === 'the_link' ? given()?.given.link : undefined;
  const the_gesture = () => {
    const it = shown();
    return it?.shows === 'the_link' ? it.gesture : undefined;
  };
  /** The link handed to the phone: its share, or its clipboard, which tells the screen once it is copied. */
  const hands_on = link => {
    const navigator = app.device.the_navigator;
    if (navigator.share !== undefined) {
      // A share she cancels, or the browser refuses, leaves the link on the screen, to share again.
      void navigator.share({
        url: link
      }).catch(() => undefined);
      return;
    }
    void navigator.clipboard.writeText(link).then(() => {
      screen.happens({
        happens: 'the_link_is_copied'
      });
    }, () => undefined);
  };
  /** She makes a link, by her active face (stage 1 has one): its ids drawn at the tap. */
  const makes_a_link = () => {
    void app.node.the_active_face().then(face => {
      if (face === undefined) return;
      screen.happens({
        happens: 'she_makes_a_link',
        asked: what_it_asked_now(app.device),
        bond: app.device.draws_an_id(),
        face
      });
    });
  };
  return (() => {
    var _el$2 = _tmpl$4(),
      _el$3 = _el$2.firstChild;
    _$insert(_el$2, _$createComponent(Back, {
      onBack: () => {
        screen.happens({
          happens: 'she_goes_back'
        });
      }
    }), _el$3);
    _$insert(_el$3, () => props.texts.title);
    _$insert(_el$2, _$createComponent(Show, {
      get when() {
        return shown();
      },
      get children() {
        return _$createComponent(Switch, {
          get children() {
            return [_$createComponent(Match, {
              get when() {
                return shown()?.shows === 'the_flaw_told';
              },
              get children() {
                return [(() => {
                  var _el$4 = _tmpl$2();
                  _$insert(_el$4, () => props.texts.the_flaw);
                  return _el$4;
                })(), _$createComponent(MakeALink, {
                  get words() {
                    return props.texts.make_a_link;
                  },
                  makes: makes_a_link
                })];
              }
            }), _$createComponent(Match, {
              get when() {
                return shown()?.shows === 'getting_the_link_ready';
              },
              get children() {
                var _el$5 = _tmpl$3();
                _$insert(_el$5, () => props.texts.getting_the_link_ready);
                return _el$5;
              }
            }), _$createComponent(Match, {
              get when() {
                return cannot_be_prepared();
              },
              children: it => [(() => {
                var _el$6 = _tmpl$3();
                _$insert(_el$6, () => props.texts.the_link_cannot_be_prepared);
                return _el$6;
              })(), (() => {
                var _el$7 = _tmpl$2();
                _$insert(_el$7, () => the_words_of_an_end(app.common, it().how));
                return _el$7;
              })(), _$createComponent(MakeALink, {
                get words() {
                  return props.texts.try_again;
                },
                makes: makes_a_link
              })]
            }), _$createComponent(Match, {
              get when() {
                return the_link();
              },
              children: link => [(() => {
                var _el$8 = _tmpl$5(),
                  _el$9 = _el$8.firstChild,
                  _el$0 = _el$9.nextSibling;
                _$insert(_el$8, () => props.texts.your_link, _el$9);
                _el$0.addEventListener("focus", event => {
                  event.currentTarget.select();
                });
                _$effect(() => _el$0.value = link());
                return _el$8;
              })(), _$createComponent(Switch, {
                get children() {
                  return [_$createComponent(Match, {
                    get when() {
                      return the_gesture() === 'copied';
                    },
                    get children() {
                      var _el$1 = _tmpl$3();
                      _$insert(_el$1, () => props.texts.the_link_is_copied);
                      return _el$1;
                    }
                  }), _$createComponent(Match, {
                    get when() {
                      return the_gesture();
                    },
                    children: gesture => (() => {
                      var _el$10 = _tmpl$();
                      _el$10.$$click = () => {
                        hands_on(link());
                      };
                      _$insert(_el$10, (() => {
                        var _c$ = _$memo(() => gesture() === 'share');
                        return () => _c$() ? props.texts.share_the_link : props.texts.copy_the_link;
                      })());
                      return _el$10;
                    })()
                  })];
                }
              }), _$createComponent(MakeALink, {
                get words() {
                  return props.texts.make_another;
                },
                makes: makes_a_link
              })]
            })];
          }
        });
      }
    }), null);
    _$effect(() => _$setAttribute(_el$2, "aria-label", props.texts.title));
    return _el$2;
  })();
};
_$delegateEvents(["click"]);
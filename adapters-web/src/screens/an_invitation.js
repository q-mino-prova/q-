import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { memo as _$memo } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<p role=status>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<section><h1>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<form><p></p><p></p><label> <input name=name></label><button type=submit></button><button type=button>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<p>`);
// An invitation, a link of a ticket she opened (UI-5, WEB-1): who wants to
// shake her hand, at a distance; the name she gives them, theirs by default;
// she accepts or declines. Accepted, her ticket is prepared and, once it is
// ready, the screen is told so once, and theirs is opened on it; offline,
// it waits, and says so. A link out of its form is told, and opens nothing.
import * as an_invitation from '@q-mino/domains/ui/an_invitation/_dsl.ts';
import { createEffect, createMemo, Match, Show, Switch, untrack } from 'solid-js';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { Back } from "./parts.js";
import { the_app, the_words_of_an_end, what_it_asked_now } from "./the_app.js";
export const AnInvitation = props => {
  const app = the_app();
  const opened_on = untrack(() => props.screen);
  const screen = a_screen(app, {
    at_the_start: () => an_invitation.at_the_start(opened_on.link),
    after: an_invitation.after,
    told_the_end: ended => ended
  });
  const given = what_it_is_given(app, screen.state, async state => {
    const step = state.step;
    if (step.step !== 'accepted') return {
      model: {
        activities: []
      },
      ready: undefined
    };
    const asked = [step.prepared.asked, step.opened?.asked].flatMap(one => one === undefined ? [] : [one]);
    const [her_ticket, cards] = await Promise.all([app.node.her_ticket(step.bond), Promise.all(asked.map(one => app.node.an_activity(one.activity_id)))]);
    const activities = cards.flatMap(card => card === undefined ? [] : [card]);
    const model = {
      activities
    };
    return {
      model,
      ready: her_ticket?.ready
    };
  });
  const shown = () => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : an_invitation.what_it_shows(state, read.given.model);
  };
  const the_invitation = () => {
    const it = shown();
    return it?.shows === 'the_invitation' ? it : undefined;
  };
  const on_its_way = () => {
    const it = shown();
    return it?.shows === 'on_its_way' ? it : undefined;
  };
  const bonded = () => {
    const it = shown();
    return it?.shows === 'bonded' ? it : undefined;
  };
  const no_longer_holds = () => {
    const it = shown();
    return it?.shows === 'the_invitation_no_longer_holds' ? it : undefined;
  };
  // Her ticket ready for the bond she accepted on, before theirs is opened:
  // the screen is told once (its model opens theirs on it).
  const her_ticket_ready = createMemo(() => {
    const step = screen.state()?.step;
    const ready = given()?.given.ready;
    return step?.step === 'accepted' && step.opened === undefined && ready?.bond === step.bond ? ready.bond : undefined;
  });
  createEffect(() => {
    const bond = her_ticket_ready();
    if (bond === undefined) return;
    untrack(() => {
      screen.happens({
        happens: 'her_ticket_is_ready',
        bond
      });
    });
  });
  /** She accepts, by her active face (stage 1 has one): the bond's id and the two activities' drawn at the tap. */
  const accepts = () => {
    void app.node.the_active_face().then(face => {
      if (face === undefined) return;
      screen.happens({
        happens: 'she_accepts',
        bond: app.device.draws_an_id(),
        face,
        to_prepare: what_it_asked_now(app.device),
        to_open: what_it_asked_now(app.device)
      });
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
    _$insert(_el$, _$createComponent(Show, {
      get when() {
        return shown();
      },
      get children() {
        return _$createComponent(Switch, {
          get children() {
            return [_$createComponent(Match, {
              get when() {
                return shown()?.shows === 'not_an_invitation';
              },
              get children() {
                var _el$3 = _tmpl$();
                _$insert(_el$3, () => props.texts.not_an_invitation);
                return _el$3;
              }
            }), _$createComponent(Match, {
              get when() {
                return the_invitation();
              },
              children: it => (() => {
                var _el$4 = _tmpl$3(),
                  _el$5 = _el$4.firstChild,
                  _el$6 = _el$5.nextSibling,
                  _el$7 = _el$6.nextSibling,
                  _el$8 = _el$7.firstChild,
                  _el$9 = _el$8.nextSibling,
                  _el$0 = _el$7.nextSibling,
                  _el$1 = _el$0.nextSibling;
                _el$4.addEventListener("submit", event => {
                  event.preventDefault();
                  accepts();
                });
                _$insert(_el$5, () => props.texts.wants_to_shake_your_hand(it().introduced_as));
                _$insert(_el$6, () => props.texts.if_you_accept);
                _$insert(_el$7, () => props.texts.the_name_you_give, _el$8);
                _el$9.$$input = event => {
                  screen.happens({
                    happens: 'she_types_the_name',
                    name: event.currentTarget.value
                  });
                };
                _$insert(_el$0, () => props.texts.accept);
                _el$1.$$click = () => {
                  screen.happens({
                    happens: 'she_declines'
                  });
                };
                _$insert(_el$1, () => props.texts.decline);
                _$effect(() => _el$0.disabled = it().the_button !== 'on');
                _$effect(() => _el$9.value = it().name);
                return _el$4;
              })()
            }), _$createComponent(Match, {
              get when() {
                return on_its_way();
              },
              children: it => [(() => {
                var _el$10 = _tmpl$();
                _$insert(_el$10, () => props.texts.on_its_way(it().introduced_as));
                return _el$10;
              })(), (() => {
                var _el$11 = _tmpl$4();
                _$insert(_el$11, () => props.texts.it_waits_offline);
                return _el$11;
              })()]
            }), _$createComponent(Match, {
              get when() {
                return bonded();
              },
              children: it => (() => {
                var _el$12 = _tmpl$();
                _$insert(_el$12, (() => {
                  var _c$ = _$memo(() => !!it().already);
                  return () => _c$() ? props.texts.bonded_already(it().introduced_as) : props.texts.bonded(it().introduced_as);
                })());
                return _el$12;
              })()
            }), _$createComponent(Match, {
              get when() {
                return no_longer_holds();
              },
              children: it => [(() => {
                var _el$13 = _tmpl$();
                _$insert(_el$13, () => props.texts.no_longer_holds(it().introduced_as));
                return _el$13;
              })(), (() => {
                var _el$14 = _tmpl$4();
                _$insert(_el$14, () => the_words_of_an_end(app.common, it().how));
                return _el$14;
              })()]
            })];
          }
        });
      }
    }), null);
    _$effect(() => _$setAttribute(_el$, "aria-label", props.texts.title));
    return _el$;
  })();
};
_$delegateEvents(["input", "click"]);
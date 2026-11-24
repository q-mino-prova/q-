import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { memo as _$memo } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<section><h1>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<button type=button>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<nav><button type=button>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<p>`),
  _tmpl$5 = /*#__PURE__*/_$template(`<ul>`),
  _tmpl$6 = /*#__PURE__*/_$template(`<li><button type=button></button><small> `),
  _tmpl$7 = /*#__PURE__*/_$template(`<small> `);
// Her contacts, the home of stage 1 (UI-5): her bonds by the names she gives
// them, as introduced when it differs, whether they have her; none yet, the
// two handshakes; the menu; a word when something happened.
import * as my_contacts from '@q-mino/domains/ui/my_contacts/_dsl.ts';
import { For, Match, Show, Switch } from 'solid-js';
import { a_screen, what_it_is_given } from "./a_screen.js";
import { the_app } from "./the_app.js";
export const MyContacts = props => {
  const app = the_app();
  const screen = a_screen(app, {
    at_the_start: my_contacts.at_the_start,
    after: my_contacts.after
  });
  const given = what_it_is_given(app, screen.state, async () => {
    const [contacts, held_letters, happened] = await Promise.all([app.node.her_contacts(), app.node.the_held_letters(), app.node.what_happened()]);
    return {
      contacts: [...contacts],
      held_letters: held_letters.length,
      happened: happened.length
    };
  });
  const shown = () => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : my_contacts.what_it_shows(state, read.given);
  };
  const none_yet = () => {
    const contacts = shown()?.contacts;
    return contacts?.are === 'none_yet' ? contacts : undefined;
  };
  const some = () => {
    const contacts = shown()?.contacts;
    return contacts?.are === 'some' ? contacts : undefined;
  };
  const chooses = entry => {
    screen.happens({
      happens: 'she_chooses',
      entry
    });
  };
  return (() => {
    var _el$ = _tmpl$(),
      _el$2 = _el$.firstChild;
    _$insert(_el$2, () => props.texts.title);
    _$insert(_el$, _$createComponent(Show, {
      get when() {
        return shown();
      },
      children: it => [_$createComponent(Show, {
        get when() {
          return it().menu;
        },
        get fallback() {
          return (() => {
            var _el$3 = _tmpl$2();
            _el$3.$$click = () => {
              screen.happens({
                happens: 'she_opens_the_menu'
              });
            };
            _$insert(_el$3, () => props.texts.the_menu);
            return _el$3;
          })();
        },
        children: menu => (() => {
          var _el$4 = _tmpl$3(),
            _el$5 = _el$4.firstChild;
          _$insert(_el$4, _$createComponent(For, {
            get each() {
              return menu();
            },
            children: entry => (() => {
              var _el$6 = _tmpl$2();
              _el$6.$$click = () => {
                chooses(entry);
              };
              _$insert(_el$6, () => props.texts.the_entries[entry]);
              return _el$6;
            })()
          }), _el$5);
          _el$5.$$click = () => {
            screen.happens({
              happens: 'she_closes_the_menu'
            });
          };
          _$insert(_el$5, () => props.texts.close_the_menu);
          _$effect(() => _$setAttribute(_el$4, "aria-label", props.texts.the_menu));
          return _el$4;
        })()
      }), _$createComponent(Show, {
        get when() {
          return it().something_happened;
        },
        children: something => (() => {
          var _el$7 = _tmpl$2();
          _el$7.$$click = () => {
            screen.happens({
              happens: 'she_opens_what_happened'
            });
          };
          _$insert(_el$7, () => props.texts.something_happened(something().held_letters, something().happened));
          return _el$7;
        })()
      }), _$createComponent(Switch, {
        get children() {
          return [_$createComponent(Match, {
            get when() {
              return none_yet();
            },
            children: none => [(() => {
              var _el$8 = _tmpl$4();
              _$insert(_el$8, () => props.texts.none_yet);
              return _el$8;
            })(), _$createComponent(For, {
              get each() {
                return none().ways;
              },
              children: entry => (() => {
                var _el$9 = _tmpl$2();
                _el$9.$$click = () => {
                  chooses(entry);
                };
                _$insert(_el$9, () => props.texts.the_entries[entry]);
                return _el$9;
              })()
            })]
          }), _$createComponent(Match, {
            get when() {
              return some();
            },
            children: contacts => (() => {
              var _el$0 = _tmpl$5();
              _$insert(_el$0, _$createComponent(For, {
                get each() {
                  return contacts().list;
                },
                children: contact => (() => {
                  var _el$1 = _tmpl$6(),
                    _el$10 = _el$1.firstChild,
                    _el$11 = _el$10.nextSibling,
                    _el$12 = _el$11.firstChild;
                  _el$10.$$click = () => {
                    screen.happens({
                      happens: 'she_opens_a_contact',
                      bond: contact.bond
                    });
                  };
                  _$insert(_el$10, () => contact.name);
                  _$insert(_el$1, _$createComponent(Show, {
                    get when() {
                      return contact.introduced_as;
                    },
                    children: introduced => (() => {
                      var _el$13 = _tmpl$7(),
                        _el$14 = _el$13.firstChild;
                      _$insert(_el$13, () => props.texts.introduced_as(introduced()), null);
                      return _el$13;
                    })()
                  }), _el$11);
                  _$insert(_el$11, (() => {
                    var _c$ = _$memo(() => !!contact.they_have_me);
                    return () => _c$() ? props.texts.they_have_you : props.texts.not_yet;
                  })(), null);
                  return _el$1;
                })()
              }));
              return _el$0;
            })()
          })];
        }
      })]
    }), null);
    _$effect(() => _$setAttribute(_el$, "aria-label", props.texts.title));
    return _el$;
  })();
};
_$delegateEvents(["click"]);
import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<p role=status>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<p role=alert>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<main>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<div>`),
  _tmpl$5 = /*#__PURE__*/_$template(`<p>`),
  _tmpl$6 = /*#__PURE__*/_$template(`<section role=alert><h1></h1><h2></h2><pre>`),
  _tmpl$7 = /*#__PURE__*/_$template(`<button type=button>`);
// The screens of the phone, rendered (UI-1, V2, ADP-7): the way she opened
// them, each kept while it is open (only the last shown); the start read
// from her node (her faces, the face she acts as, a link she opened), and,
// when those reads fail, the fault told, never an endless wait (a record out
// of its form told as the data of an older test release, WEB-8, with the
// gesture to clear them where the composition root gives it); what a turn
// asks handed to her node in the order asked, and where it goes on the way;
// her node's changes counted, so that each screen reads it again.
import * as ui from '@q-mino/domains/ui/_dsl.ts';
import { createResource, createSignal, For, Match, onCleanup, onMount, Show, Switch } from 'solid-js';
import { ARecordOutOfItsForm } from "../indexeddb/index.js";
import { AContact } from "./a_contact.js";
import { APage } from "./a_page.js";
import { AnExtension } from "./an_extension.js";
import { AnInvitation } from "./an_invitation.js";
import { MyContacts } from "./my_contacts.js";
import { TheAppContext, TheScreenIsShown } from "./the_app.js";
import { TheExtensions } from "./the_extensions.js";
import { TheFirstFace } from "./the_first_face.js";
import { TheHandshakeAtADistance } from "./the_handshake_at_a_distance.js";
import { TheHandshakeInPerson } from "./the_handshake_in_person.js";
import { TheServer } from "./the_server.js";
import { WhatHappened } from "./what_happened.js";
const why_they_do_not_open = fault => fault instanceof ARecordOutOfItsForm ? {
  why: 'the_data_of_an_older_test_release',
  message: fault.message
} : {
  why: 'a_fault',
  message: fault instanceof Error ? fault.message : String(fault)
};
export const TheScreens = props => {
  const [way, set_way] = createSignal(undefined);
  const [changes, set_changes] = createSignal(0);
  const [went_wrong, set_went_wrong] = createSignal(false);
  const [the_link, set_the_link] = createSignal(undefined);
  const [does_not_open, set_does_not_open] = createSignal(undefined);
  const changed = () => {
    set_changes(count => count + 1);
  };
  // What a turn asks, handed in the order asked: a draft kept as she types
  // is kept in the order of her keys.
  let handed = Promise.resolve();
  const asks = what => {
    handed = handed.then(() => props.node.asks(what)).then(changed, () => {
      set_went_wrong(true);
    });
  };
  const starts = async () => {
    const read = await Promise.all([props.node.her_faces(), props.node.the_active_face()]).then(both => ({
      read: 'done',
      both
    }), fault => ({
      read: 'failed',
      why: why_they_do_not_open(fault)
    }));
    if (read.read === 'failed') {
      set_does_not_open(read.why);
      return;
    }
    const [faces, the_active_face] = read.both;
    const start = ui.the_start({
      faces,
      the_active_face,
      a_link: the_link()
    });
    // A link waits for her first face; once she has one, the start opens it, once.
    if (faces.length > 0) set_the_link(undefined);
    for (const one of start.asks) asks(one);
    set_way(start.way);
  };
  const goes = where => {
    if (where.goes === 'to_the_start') {
      void starts();
      return;
    }
    set_way(now => now === undefined ? now : ui.the_way_after(now, where, now));
  };
  const app = {
    get node() {
      return props.node;
    },
    get device() {
      return props.device;
    },
    get common() {
      return props.texts.common;
    },
    changes,
    asks,
    goes,
    words: extension => props.texts.extensions[extension]
  };
  // The strip over every screen (UI-5), read again at each change of her node: no network, else the relay that did not answer.
  const [the_strip] = createResource(changes, async () => ui.the_strip({
    relay: (await props.node.the_relay()).met,
    network: await props.node.the_network()
  }));
  onMount(() => {
    set_the_link(props.a_link);
    onCleanup(props.node.when_it_changes(changed));
    void starts();
  });
  const the_screen = screen => {
    switch (screen.screen) {
      case 'the_first_face':
        return _$createComponent(TheFirstFace, {
          get texts() {
            return props.texts.the_first_face;
          }
        });
      case 'my_contacts':
        return _$createComponent(MyContacts, {
          get texts() {
            return props.texts.my_contacts;
          }
        });
      case 'a_contact':
        return _$createComponent(AContact, {
          get texts() {
            return props.texts.a_contact;
          },
          screen: screen
        });
      case 'the_handshake_in_person':
        return _$createComponent(TheHandshakeInPerson, {
          get texts() {
            return props.texts.the_handshake_in_person;
          }
        });
      case 'the_handshake_at_a_distance':
        return _$createComponent(TheHandshakeAtADistance, {
          get texts() {
            return props.texts.the_handshake_at_a_distance;
          }
        });
      case 'an_invitation':
        return _$createComponent(AnInvitation, {
          get texts() {
            return props.texts.an_invitation;
          },
          screen: screen
        });
      case 'the_extensions':
        return _$createComponent(TheExtensions, {
          get texts() {
            return props.texts.the_extensions;
          }
        });
      case 'an_extension':
        return _$createComponent(AnExtension, {
          get texts() {
            return props.texts.an_extension;
          },
          screen: screen
        });
      case 'a_page':
        return _$createComponent(APage, {
          get texts() {
            return props.texts.a_page;
          },
          screen: screen
        });
      case 'what_happened':
        return _$createComponent(WhatHappened, {
          get texts() {
            return props.texts.what_happened;
          }
        });
      case 'the_server':
        return _$createComponent(TheServer, {
          get texts() {
            return props.texts.the_server;
          }
        });
    }
  };
  return _$createComponent(TheAppContext.Provider, {
    value: app,
    get children() {
      var _el$ = _tmpl$3();
      _$insert(_el$, _$createComponent(Switch, {
        get children() {
          return [_$createComponent(Match, {
            get when() {
              return the_strip()?.strip === 'no_network';
            },
            get children() {
              var _el$2 = _tmpl$();
              _$insert(_el$2, () => props.texts.common.no_network);
              return _el$2;
            }
          }), _$createComponent(Match, {
            get when() {
              return the_strip()?.strip === 'the_relay_does_not_answer';
            },
            get children() {
              var _el$3 = _tmpl$();
              _$insert(_el$3, () => props.texts.common.the_relay_does_not_answer);
              return _el$3;
            }
          })];
        }
      }), null);
      _$insert(_el$, _$createComponent(Show, {
        get when() {
          return does_not_open();
        },
        get fallback() {
          return _$createComponent(Show, {
            get when() {
              return way();
            },
            get fallback() {
              return (() => {
                var _el$5 = _tmpl$();
                _$insert(_el$5, () => props.texts.common.opening);
                return _el$5;
              })();
            },
            children: the_way => _$createComponent(For, {
              get each() {
                return the_way();
              },
              children: (screen, index) => {
                const shown = () => index() === the_way().length - 1;
                return _$createComponent(TheScreenIsShown.Provider, {
                  value: shown,
                  get children() {
                    var _el$6 = _tmpl$4();
                    _$insert(_el$6, () => the_screen(screen));
                    _$effect(() => _el$6.hidden = !shown());
                    return _el$6;
                  }
                });
              }
            })
          });
        },
        children: why => (() => {
          var _el$7 = _tmpl$6(),
            _el$8 = _el$7.firstChild,
            _el$0 = _el$8.nextSibling,
            _el$1 = _el$0.nextSibling;
          _$insert(_el$8, () => props.texts.common.it_does_not_start);
          _$insert(_el$7, _$createComponent(Show, {
            get when() {
              return why().why === 'the_data_of_an_older_test_release';
            },
            get children() {
              return [(() => {
                var _el$9 = _tmpl$5();
                _$insert(_el$9, () => props.texts.common.the_data_of_an_older_test_release);
                return _el$9;
              })(), _$createComponent(Show, {
                get when() {
                  return props.clears_the_data_and_starts_again;
                },
                children: clears => (() => {
                  var _el$10 = _tmpl$7();
                  _el$10.$$click = () => {
                    clears()();
                  };
                  _$insert(_el$10, () => props.texts.common.clear_the_data_and_start_again);
                  return _el$10;
                })()
              })];
            }
          }), _el$0);
          _$insert(_el$0, () => props.texts.common.why);
          _$insert(_el$1, () => why().message);
          return _el$7;
        })()
      }), null);
      _$insert(_el$, _$createComponent(Show, {
        get when() {
          return went_wrong();
        },
        get children() {
          var _el$4 = _tmpl$2();
          _$insert(_el$4, () => props.texts.common.something_went_wrong);
          return _el$4;
        }
      }), null);
      return _el$;
    }
  });
};
_$delegateEvents(["click"]);
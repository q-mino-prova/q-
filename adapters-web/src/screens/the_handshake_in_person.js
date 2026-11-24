import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { use as _$use } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<p>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<img>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<p role=status>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<button type=button>`),
  _tmpl$5 = /*#__PURE__*/_$template(`<section><h1></h1><video muted playsinline>`);
// The handshake in person, the crossed QR (UI-5, WEB-1, WEB-2): opened, the
// screen prepares a ticket of hers; ready, it shows the QR of its link and
// plays the camera in its video, each text it reads told as a scan: the
// front camera by default (the two face each other, screen to screen),
// turned to the rear and back by her gesture where the device has more than
// one; the camera is on only while she scans, off once she does not and
// when the screen closes. Once she scanned theirs, her QR stays shown, the
// camera off, until her gesture puts it away (the other phone may still be
// reading it); then bonded, she opens the contact or shakes another hand.
import * as ui_value from '@q-mino/domains/ui/_value.ts';
import * as the_handshake_in_person from '@q-mino/domains/ui/the_handshake_in_person/_dsl.ts';
import { createEffect, createMemo, createSignal, Match, onCleanup, Show, Switch } from 'solid-js';
import { the_qr_of } from "../qr/index.js";
import { the_ticket_in_a_link } from "../ticket_link/index.js";
import { a_screen, what_it_is_given } from "./a_screen.js";
import { Back } from "./parts.js";
import { the_app, the_words_of_an_end, what_it_asked_now } from "./the_app.js";
/** What a text the camera read holds, as the link of a ticket carries it (WEB-1), the ticket in her words or out of its form. */
const what_it_holds = text => {
  const read = the_ticket_in_a_link(text);
  switch (read.carries) {
    case 'a_ticket':
      {
        const parsed = ui_value.what_it_holds.safeParse({
          holds: 'a_ticket',
          ticket: read.ticket
        });
        return parsed.success ? parsed.data : {
          holds: 'a_ticket_out_of_its_form'
        };
      }
    case 'no_ticket':
      return {
        holds: 'no_ticket'
      };
    case 'a_ticket_out_of_its_form':
      return {
        holds: 'a_ticket_out_of_its_form'
      };
  }
};
/** The QR of her ticket's link, or the link alone when it is longer than a QR holds. */
const TheQr = props => {
  const qr = createMemo(() => the_qr_of(props.link));
  const drawn = () => {
    const it = qr();
    return it.drawn === 'a_qr' ? it : undefined;
  };
  return _$createComponent(Show, {
    get when() {
      return drawn();
    },
    get fallback() {
      return [(() => {
        var _el$ = _tmpl$();
        _$insert(_el$, () => props.texts.too_long_for_a_qr);
        return _el$;
      })(), (() => {
        var _el$2 = _tmpl$();
        _$insert(_el$2, () => props.link);
        return _el$2;
      })()];
    },
    children: it => (() => {
      var _el$3 = _tmpl$2();
      _$effect(_p$ => {
        var _v$ = props.texts.the_qr,
          _v$2 = `data:image/svg+xml,${encodeURIComponent(it().svg)}`;
        _v$ !== _p$.e && _$setAttribute(_el$3, "alt", _p$.e = _v$);
        _v$2 !== _p$.t && _$setAttribute(_el$3, "src", _p$.t = _v$2);
        return _p$;
      }, {
        e: undefined,
        t: undefined
      });
      return _el$3;
    })()
  });
};
/** Where the camera faces, by its side, in the browser's words (WEB-2): the front faces her. */
const the_facing_of = {
  front: 'user',
  rear: 'environment'
};
/** Her QR, the camera's words and the gesture that turns it while she scans (her ticket ready, or theirs not opened). */
const WhileSheScans = props => {
  const not_on = () => props.camera === 'on' ? undefined : props.camera;
  const turn = () => props.turn === 'none' ? undefined : props.turn;
  return [(() => {
    var _el$4 = _tmpl$();
    _$insert(_el$4, () => props.texts.show_and_scan);
    return _el$4;
  })(), _$createComponent(Show, {
    get when() {
      return props.link;
    },
    children: link => _$createComponent(TheQr, {
      get link() {
        return link();
      },
      get texts() {
        return props.texts;
      }
    })
  }), _$createComponent(Show, {
    get when() {
      return not_on();
    },
    children: why => (() => {
      var _el$5 = _tmpl$3();
      _$insert(_el$5, () => props.texts.the_camera[why()]);
      return _el$5;
    })()
  }), _$createComponent(Show, {
    get when() {
      return turn();
    },
    children: where => (() => {
      var _el$6 = _tmpl$4();
      _el$6.$$click = () => {
        props.onTurn();
      };
      _$insert(_el$6, () => props.texts.turn_the_camera[where()]);
      return _el$6;
    })()
  })];
};
/**
 * The words of a bond made on the screen (BND-10; Alessandro, 21 Nov 2026):
 * "in person" only when her node said it met them in person; an opening
 * done on a bond at a distance, as her node measured it, does not say it.
 */
export const the_words_of_a_bond_made = (texts, made) => made.already ? texts.bonded_already(made.introduced_as) : made.said.event === 'you_met_in_person' ? texts.bonded_in_person(made.introduced_as) : texts.bonded(made.introduced_as);
export const TheHandshakeInPerson = props => {
  const app = the_app();
  const screen = a_screen(app, {
    at_the_start: the_handshake_in_person.at_the_start,
    after: the_handshake_in_person.after,
    told_the_end: ended => ended
  });
  const given = what_it_is_given(app, screen.state, async state => {
    const asked = [state.ticket?.prepared.asked, state.scanned?.scanned === 'their_ticket' ? state.scanned.opened.asked : undefined].flatMap(one => one === undefined ? [] : [one]);
    const [her_ticket, cards] = await Promise.all([state.ticket === undefined ? undefined : app.node.her_ticket(state.ticket.bond), Promise.all(asked.map(one => app.node.an_activity(one.activity_id)))]);
    const activities = cards.flatMap(card => card === undefined ? [] : [card]);
    const model = her_ticket === undefined ? {
      activities
    } : {
      ticket: her_ticket.ready,
      activities
    };
    return {
      model,
      link: her_ticket?.link
    };
  });
  const shown = () => {
    const state = screen.state();
    const read = given();
    return state === undefined || read === undefined ? undefined : the_handshake_in_person.what_it_shows(state, read.given.model);
  };
  const link = () => given()?.given.link;
  const cannot_be_prepared = () => {
    const it = shown();
    return it?.shows === 'the_ticket_cannot_be_prepared' ? it : undefined;
  };
  const ready = () => {
    const it = shown();
    return it?.shows === 'ready' ? it : undefined;
  };
  const read = () => {
    const it = shown();
    return it?.shows === 'their_ticket_read' ? it : undefined;
  };
  const opening = () => {
    const it = shown();
    return it?.shows === 'opening_their_ticket' ? it : undefined;
  };
  const bonded = () => {
    const it = shown();
    return it?.shows === 'bonded' ? it : undefined;
  };
  const cannot_be_opened = () => {
    const it = shown();
    return it?.shows === 'their_ticket_cannot_be_opened' ? it : undefined;
  };
  const scanned_nothing_to_open = () => {
    const scanned = ready()?.scanned;
    return scanned === undefined || scanned === 'nothing' ? undefined : scanned;
  };
  /** A ticket of hers for a bond to be, by her active face (stage 1 has one): its ids drawn at the gesture. */
  const a_new_ticket = happens => {
    void app.node.the_active_face().then(face => {
      if (face === undefined) return;
      screen.happens({
        happens,
        asked: what_it_asked_now(app.device),
        bond: app.device.draws_an_id(),
        face
      });
    });
  };
  // Opened: once its state is there, the screen is opened, once.
  const started = createMemo(() => screen.state() !== undefined);
  createEffect(() => {
    if (started()) a_new_ticket('the_screen_is_opened');
  });
  // The camera, on while she scans, facing her side's way; each text it reads
  // told as a scan, with an activity drawn, and the device's cameras counted
  // once it is on; off once she no longer scans, when she turns it (the
  // device's camera turns the one before off before it opens the next, WEB-2)
  // and when the screen closes.
  const [video, set_video] = createSignal();
  const scanning = createMemo(() => ready() !== undefined || cannot_be_opened() !== undefined);
  const facing = createMemo(() => {
    const side = (ready() ?? cannot_be_opened())?.side;
    return side === undefined ? undefined : the_facing_of[side];
  });
  const turns_the_camera = () => {
    screen.happens({
      happens: 'she_turns_the_camera'
    });
  };
  createEffect(() => {
    const element = video();
    const facing_now = facing();
    if (element === undefined || facing_now === undefined) return;
    const a_scan = app.device.scans(element, facing_now);
    // This scan's run over (she no longer scans, or the screen closed): what it reads then is told no more.
    let over = false;
    const is_over = () => over;
    onCleanup(() => {
      over = true;
      void a_scan.then(scan => {
        if (scan.is === 'on') scan.turn_off();
      });
    });
    void a_scan.then(async scan => {
      if (is_over()) return;
      screen.happens({
        happens: 'the_camera_is',
        camera: scan.is
      });
      if (scan.is !== 'on') return;
      screen.happens({
        happens: 'the_cameras_are_counted',
        cameras: scan.cameras
      });
      for await (const text of scan.texts) {
        if (is_over()) return;
        screen.happens({
          happens: 'she_scans',
          holds: what_it_holds(text),
          asked: what_it_asked_now(app.device)
        });
      }
    });
  });
  return (() => {
    var _el$7 = _tmpl$5(),
      _el$8 = _el$7.firstChild,
      _el$10 = _el$8.nextSibling;
    _$insert(_el$7, _$createComponent(Back, {
      onBack: () => {
        screen.happens({
          happens: 'she_goes_back'
        });
      }
    }), _el$8);
    _$insert(_el$8, () => props.texts.title);
    _$insert(_el$7, _$createComponent(Show, {
      get when() {
        return shown();
      },
      get children() {
        return _$createComponent(Switch, {
          get children() {
            return [_$createComponent(Match, {
              get when() {
                return shown()?.shows === 'getting_the_ticket_ready';
              },
              get children() {
                var _el$9 = _tmpl$3();
                _$insert(_el$9, () => props.texts.getting_the_ticket_ready);
                return _el$9;
              }
            }), _$createComponent(Match, {
              get when() {
                return cannot_be_prepared();
              },
              children: it => [(() => {
                var _el$11 = _tmpl$3();
                _$insert(_el$11, () => props.texts.the_ticket_cannot_be_prepared);
                return _el$11;
              })(), (() => {
                var _el$12 = _tmpl$();
                _$insert(_el$12, () => the_words_of_an_end(app.common, it().how));
                return _el$12;
              })(), (() => {
                var _el$13 = _tmpl$4();
                _el$13.$$click = () => {
                  a_new_ticket('she_shakes_another_hand');
                };
                _$insert(_el$13, () => props.texts.try_again);
                return _el$13;
              })()]
            }), _$createComponent(Match, {
              get when() {
                return ready();
              },
              children: it => [_$createComponent(WhileSheScans, {
                get link() {
                  return link();
                },
                get camera() {
                  return it().camera;
                },
                get turn() {
                  return it().turn;
                },
                onTurn: turns_the_camera,
                get texts() {
                  return props.texts;
                }
              }), _$createComponent(Show, {
                get when() {
                  return scanned_nothing_to_open();
                },
                children: scanned => (() => {
                  var _el$14 = _tmpl$3();
                  _$insert(_el$14, () => props.texts.scanned[scanned()]);
                  return _el$14;
                })()
              })]
            }), _$createComponent(Match, {
              get when() {
                return read();
              },
              get children() {
                return [(() => {
                  var _el$0 = _tmpl$3();
                  _$insert(_el$0, () => props.texts.their_ticket_read);
                  return _el$0;
                })(), _$createComponent(Show, {
                  get when() {
                    return link();
                  },
                  children: link => _$createComponent(TheQr, {
                    get link() {
                      return link();
                    },
                    get texts() {
                      return props.texts;
                    }
                  })
                }), (() => {
                  var _el$1 = _tmpl$4();
                  _el$1.$$click = () => {
                    screen.happens({
                      happens: 'she_puts_her_qr_away'
                    });
                  };
                  _$insert(_el$1, () => props.texts.done);
                  return _el$1;
                })()];
              }
            }), _$createComponent(Match, {
              get when() {
                return opening();
              },
              children: it => (() => {
                var _el$15 = _tmpl$3();
                _$insert(_el$15, () => props.texts.opening_their_ticket(it().introduced_as));
                return _el$15;
              })()
            }), _$createComponent(Match, {
              get when() {
                return bonded();
              },
              children: it => [(() => {
                var _el$16 = _tmpl$3();
                _$insert(_el$16, () => the_words_of_a_bond_made(props.texts, it()));
                return _el$16;
              })(), (() => {
                var _el$17 = _tmpl$4();
                _el$17.$$click = () => {
                  screen.happens({
                    happens: 'she_opens_the_contact'
                  });
                };
                _$insert(_el$17, () => props.texts.open_the_contact);
                return _el$17;
              })(), (() => {
                var _el$18 = _tmpl$4();
                _el$18.$$click = () => {
                  a_new_ticket('she_shakes_another_hand');
                };
                _$insert(_el$18, () => props.texts.shake_another_hand);
                return _el$18;
              })()]
            }), _$createComponent(Match, {
              get when() {
                return cannot_be_opened();
              },
              children: it => [(() => {
                var _el$19 = _tmpl$3();
                _$insert(_el$19, () => props.texts.their_ticket_cannot_be_opened(it().introduced_as));
                return _el$19;
              })(), (() => {
                var _el$20 = _tmpl$();
                _$insert(_el$20, () => the_words_of_an_end(app.common, it().how));
                return _el$20;
              })(), (() => {
                var _el$21 = _tmpl$();
                _$insert(_el$21, () => props.texts.scan_again);
                return _el$21;
              })(), _$createComponent(WhileSheScans, {
                get link() {
                  return link();
                },
                get camera() {
                  return it().camera;
                },
                get turn() {
                  return it().turn;
                },
                onTurn: turns_the_camera,
                get texts() {
                  return props.texts;
                }
              })]
            })];
          }
        });
      }
    }), _el$10);
    _$use(element => {
      set_video(() => element);
    }, _el$10);
    _$effect(_p$ => {
      var _v$3 = props.texts.title,
        _v$4 = !scanning();
      _v$3 !== _p$.e && _$setAttribute(_el$7, "aria-label", _p$.e = _v$3);
      _v$4 !== _p$.t && (_el$10.hidden = _p$.t = _v$4);
      return _p$;
    }, {
      e: undefined,
      t: undefined
    });
    return _el$7;
  })();
};
_$delegateEvents(["click"]);
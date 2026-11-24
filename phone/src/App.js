import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { memo as _$memo } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<p>`),
  _tmpl$2 = /*#__PURE__*/_$template(`<button type=button>`),
  _tmpl$3 = /*#__PURE__*/_$template(`<p><strong>`),
  _tmpl$4 = /*#__PURE__*/_$template(`<main><footer><h2></h2><p> (<!>) · <!>: <!> · <!>: <a>`),
  _tmpl$5 = /*#__PURE__*/_$template(`<h1>`),
  _tmpl$6 = /*#__PURE__*/_$template(`<section role=alert><h2></h2><pre>`),
  _tmpl$7 = /*#__PURE__*/_$template(`<ul>`),
  _tmpl$8 = /*#__PURE__*/_$template(`<li>`),
  _tmpl$9 = /*#__PURE__*/_$template(`<p role=note>`);
import { createSignal, For, Match, onMount, Show, Switch } from 'solid-js';
import { why_it_does_not_start } from "./node/index.js";
import { the_build } from "./build_info.js";
import { texts } from "./texts/index.js";
import { UpdatePrompt } from "./UpdatePrompt.js";
// The app's frame (PWA-2, PWA-5): the node's start in this tab and what it
// came to, each a screen of its own, the kernel's screens once it runs
// (WEB-18); the storage the browser keeps or may clear, told (WEB-11, F6);
// the update with notice; where the files come from. A node that stops by
// itself (another tab took it, a new release closed it) says so and offers
// to open it here again (WEB-10). The data of an older test release (WEB-8),
// met at the start or by the screens' first reads, can be cleared on the
// test channel only: the node stopped, its database deleted, the app opened
// again.
const repository = 'https://github.com/q-mino/q-';
// The commit's instant, told in the device's zone and the Italian way (A, 23 Nov 2026).
const the_time_of = instant => new Intl.DateTimeFormat('it-IT', {
  dateStyle: 'short',
  timeStyle: 'short'
}).format(Date.parse(instant));
export const App = props => {
  const [now, set_now] = createSignal({
    now: 'opening'
  });
  const opens = how => {
    set_now({
      now: 'opening'
    });
    props.starts(how).then(start => {
      switch (start.start) {
        case 'another_tab':
          set_now({
            now: 'another_tab'
          });
          return;
        case 'it_does_not_start':
          set_now({
            now: 'it_does_not_start',
            why: start.why
          });
          return;
        case 'running':
          set_now({
            now: 'running',
            node: start.node
          });
          void start.node.stopped.then(why => {
            // Stopped to clear the data, the node is not told as stopped by itself.
            if (now().now !== 'clearing_the_data') set_now({
              now: 'stopped',
              why
            });
          });
          return;
      }
    }, fault => {
      set_now({
        now: 'it_does_not_start',
        why: why_it_does_not_start(fault)
      });
    });
  };
  /** Her gesture on the data of an older test release (WEB-8): the node stopped, if it runs, its database deleted, the app opened again. */
  const clears_the_data_and_starts_again = node => {
    set_now({
      now: 'clearing_the_data'
    });
    void (async () => {
      await node?.stops();
      await props.clears_the_data();
      props.reopens();
    })().catch(fault => {
      set_now({
        now: 'it_does_not_start',
        why: why_it_does_not_start(fault)
      });
    });
  };
  /** The gesture, on the test channel only (WEB-8): on the release the sentence alone. */
  const on_the_test_channel = the_build.channel !== 'release';
  onMount(() => {
    opens('if_no_tab_is');
  });
  const running = () => {
    const it = now();
    return it.now === 'running' ? it.node : undefined;
  };
  const does_not_start = () => {
    const it = now();
    return it.now === 'it_does_not_start' ? it.why : undefined;
  };
  const stopped = () => {
    const it = now();
    return it.now === 'stopped' ? it.why : undefined;
  };
  const before_the_update = async () => {
    await running()?.stops();
  };
  return (() => {
    var _el$ = _tmpl$4(),
      _el$5 = _el$.firstChild,
      _el$8 = _el$5.firstChild,
      _el$9 = _el$8.nextSibling,
      _el$0 = _el$9.firstChild,
      _el$16 = _el$0.nextSibling,
      _el$1 = _el$16.nextSibling,
      _el$17 = _el$1.nextSibling,
      _el$10 = _el$17.nextSibling,
      _el$18 = _el$10.nextSibling,
      _el$11 = _el$18.nextSibling,
      _el$19 = _el$11.nextSibling,
      _el$13 = _el$19.nextSibling,
      _el$15 = _el$13.nextSibling;
    _$insert(_el$, _$createComponent(Switch, {
      get children() {
        return [_$createComponent(Match, {
          get when() {
            return now().now === 'opening' || now().now === 'clearing_the_data';
          },
          get children() {
            var _el$2 = _tmpl$();
            _$insert(_el$2, () => texts.start.opening);
            return _el$2;
          }
        }), _$createComponent(Match, {
          get when() {
            return now().now === 'another_tab';
          },
          get children() {
            return [(() => {
              var _el$3 = _tmpl$();
              _$insert(_el$3, () => texts.start.another_tab);
              return _el$3;
            })(), (() => {
              var _el$4 = _tmpl$2();
              _el$4.$$click = () => {
                opens('use_here');
              };
              _$insert(_el$4, () => texts.start.use_here);
              return _el$4;
            })()];
          }
        }), _$createComponent(Match, {
          get when() {
            return does_not_start();
          },
          children: why => (() => {
            var _el$20 = _tmpl$6(),
              _el$25 = _el$20.firstChild,
              _el$26 = _el$25.nextSibling;
            _$insert(_el$20, _$createComponent(Switch, {
              get children() {
                return [_$createComponent(Match, {
                  get when() {
                    const it = why();
                    return it.why === 'an_extension_does_not_compose' ? it : undefined;
                  },
                  children: composing => [(() => {
                    var _el$27 = _tmpl$5();
                    _$insert(_el$27, () => texts.start.an_extension_does_not_compose);
                    return _el$27;
                  })(), (() => {
                    var _el$28 = _tmpl$7();
                    _$insert(_el$28, _$createComponent(For, {
                      get each() {
                        return composing().faults;
                      },
                      children: one => (() => {
                        var _el$29 = _tmpl$8();
                        _$insert(_el$29, () => texts.start.the_composition_faults[one.fault](one.extension));
                        return _el$29;
                      })()
                    }));
                    return _el$28;
                  })()]
                }), _$createComponent(Match, {
                  get when() {
                    return why().why === 'the_data_of_an_older_test_release';
                  },
                  get children() {
                    return [(() => {
                      var _el$21 = _tmpl$5();
                      _$insert(_el$21, () => texts.start.it_does_not_start);
                      return _el$21;
                    })(), (() => {
                      var _el$22 = _tmpl$();
                      _$insert(_el$22, () => texts.start.the_data_of_an_older_test_release);
                      return _el$22;
                    })(), _$createComponent(Show, {
                      when: on_the_test_channel,
                      get children() {
                        var _el$23 = _tmpl$2();
                        _el$23.$$click = () => {
                          clears_the_data_and_starts_again(undefined);
                        };
                        _$insert(_el$23, () => texts.start.clear_the_data_and_start_again);
                        return _el$23;
                      }
                    })];
                  }
                }), _$createComponent(Match, {
                  get when() {
                    return why().why === 'a_fault';
                  },
                  get children() {
                    var _el$24 = _tmpl$5();
                    _$insert(_el$24, () => texts.start.it_does_not_start);
                    return _el$24;
                  }
                })];
              }
            }), _el$25);
            _$insert(_el$25, () => texts.start.why);
            _$insert(_el$26, () => why().message);
            return _el$20;
          })()
        }), _$createComponent(Match, {
          get when() {
            return stopped();
          },
          children: why => _$createComponent(Switch, {
            get children() {
              return [_$createComponent(Match, {
                get when() {
                  return why() === 'used_elsewhere';
                },
                get children() {
                  return [(() => {
                    var _el$30 = _tmpl$();
                    _$insert(_el$30, () => texts.start.used_elsewhere);
                    return _el$30;
                  })(), (() => {
                    var _el$31 = _tmpl$2();
                    _el$31.$$click = () => {
                      opens('use_here');
                    };
                    _$insert(_el$31, () => texts.start.use_here);
                    return _el$31;
                  })()];
                }
              }), _$createComponent(Match, {
                get when() {
                  return why() === 'closed_for_a_new_release';
                },
                get children() {
                  return [(() => {
                    var _el$32 = _tmpl$();
                    _$insert(_el$32, () => texts.start.closed_for_a_new_release);
                    return _el$32;
                  })(), (() => {
                    var _el$33 = _tmpl$2();
                    _el$33.$$click = () => {
                      props.reopens();
                    };
                    _$insert(_el$33, () => texts.start.reload);
                    return _el$33;
                  })()];
                }
              })];
            }
          })
        }), _$createComponent(Match, {
          get when() {
            return running();
          },
          children: node => [_$createComponent(Show, {
            get when() {
              return node().the_storage === 'best_effort';
            },
            get children() {
              var _el$34 = _tmpl$9();
              _$insert(_el$34, () => texts.the_storage.best_effort);
              return _el$34;
            }
          }), _$createComponent(Show, {
            get when() {
              return node().the_storage === 'not_told';
            },
            get children() {
              var _el$35 = _tmpl$9();
              _$insert(_el$35, () => texts.the_storage.not_told);
              return _el$35;
            }
          }), _$memo(() => props.screens(node(), on_the_test_channel ? () => {
            clears_the_data_and_starts_again(node());
          } : undefined))]
        })];
      }
    }), _el$5);
    _$insert(_el$5, _$createComponent(Show, {
      get when() {
        return the_build.channel !== 'release';
      },
      get children() {
        var _el$6 = _tmpl$3(),
          _el$7 = _el$6.firstChild;
        _$insert(_el$7, () => texts.app.testChannel);
        return _el$6;
      }
    }), _el$8);
    _$insert(_el$8, () => texts.about.title);
    _$insert(_el$9, () => texts.app.name, _el$0);
    _$insert(_el$9, () => texts.app.reading, _el$16);
    _$insert(_el$9, () => texts.about.version, _el$17);
    _$insert(_el$9, () => the_build.version, _el$18);
    _$insert(_el$9, () => texts.about.code, _el$19);
    _$insert(_el$15, () => the_build.commit.slice(0, 7));
    _$insert(_el$9, _$createComponent(Show, {
      get when() {
        return the_build.committed_at !== 'unknown';
      },
      get children() {
        return [' ', _$memo(() => texts.about.committed_on(the_time_of(the_build.committed_at)))];
      }
    }), null);
    _$insert(_el$, _$createComponent(UpdatePrompt, {
      before_the_update: before_the_update
    }), null);
    _$effect(() => _$setAttribute(_el$15, "href", `${repository}/commit/${the_build.commit}`));
    return _el$;
  })();
};
_$delegateEvents(["click"]);
import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<div role=alertdialog aria-live=polite><p></p><p></p><button type=button></button><button type=button>`);
import { createSignal, onMount, Show } from 'solid-js';
import { the_build } from "./build_info.js";
import { texts } from "./texts/index.js";
// The update with notice (PWA-5): the new service worker downloads and
// waits, and the old code keeps running until she chooses "Aggiorna";
// nothing happens in silence. Before the switch the node stops (its
// consumers, its extensions unloaded, the writer let go, WEB-10), so that
// the new release opens the database alone. On the browser's own events
// (`navigator.serviceWorker`), with no library. [Q, C, 24 Nov 2026]
/** The worker of a new release once it is installed and waits: there is one only if a release runs already. */
const when_a_new_one_waits = (registration, waits) => {
  const a_page_runs = () => navigator.serviceWorker.controller !== null;
  if (registration.waiting !== null && a_page_runs()) waits(registration.waiting);
  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    installing?.addEventListener('statechange', () => {
      if (installing.state === 'installed' && a_page_runs()) waits(installing);
    });
  });
};
export const UpdatePrompt = props => {
  const [waiting, set_waiting] = createSignal();
  onMount(() => {
    // No service worker out of a secure context (a page over plain http, not localhost).
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register(`${the_build.base}sw.js`, {
      scope: the_build.base,
      updateViaCache: 'none'
    }).then(registration => {
      when_a_new_one_waits(registration, set_waiting);
    })
    // Not registered, the app works online only: nothing to tell before an update.
    .catch(() => undefined);
  });
  const updates = async worker => {
    await props.before_the_update();
    // The new release takes the page, then the page opens again under it.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      location.reload();
    });
    worker.postMessage({
      type: 'SKIP_WAITING'
    });
  };
  return _$createComponent(Show, {
    get when() {
      return waiting();
    },
    children: worker => (() => {
      var _el$ = _tmpl$(),
        _el$2 = _el$.firstChild,
        _el$3 = _el$2.nextSibling,
        _el$4 = _el$3.nextSibling,
        _el$5 = _el$4.nextSibling;
      _$insert(_el$2, () => texts.update.available);
      _$insert(_el$3, () => texts.update.whatChanges);
      _el$4.$$click = () => void updates(worker());
      _$insert(_el$4, () => texts.update.apply);
      _el$5.$$click = () => {
        set_waiting(undefined);
      };
      _$insert(_el$5, () => texts.update.later);
      return _el$;
    })()
  });
};
_$delegateEvents(["click"]);
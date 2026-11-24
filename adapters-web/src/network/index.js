// The device's network (WEB-4; UI-5's strip): the source the configurator
// injects, as it injects the clock. Nothing else of the phone reads
// `navigator`. The browser tells one thing for sure, that the device has no
// network (`navigator.onLine` false); that it has one says nothing of the
// relay (a network with no way out, a relay silent), so it is not told.
/**
 * The device's network (WEB-4): `navigator.onLine` read at each ask, false
 * told `offline`, true `not_told`; the page's `online` and `offline` events
 * told to whoever listens, until it stops listening.
 */
export const the_device_s_network = (page) => ({
    now: () => (page.navigator.onLine ? 'not_told' : 'offline'),
    when_it_changes: (tell) => {
        const told = () => {
            tell();
        };
        page.window.addEventListener('online', told);
        page.window.addEventListener('offline', told);
        return () => {
            page.window.removeEventListener('online', told);
            page.window.removeEventListener('offline', told);
        };
    },
});

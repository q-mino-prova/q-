// A camera of test (WEB-2): on when a screen scans, facing where it asks,
// with the device's cameras the story gives; the QRs' texts shown to it by
// the story, each given to the scan that is on; turned off, its texts end
// and what it is shown then is seen by no one. Every wait is the
// story's: nothing here loops.
const a_scan_on = (cameras) => {
    let shown = [];
    let waiting;
    let off = false;
    const the_end = { done: true, value: undefined };
    const turn_off = () => {
        off = true;
        shown = [];
        waiting?.(the_end);
        waiting = undefined;
    };
    const gives = (text) => {
        if (off)
            return;
        if (waiting === undefined) {
            shown = [...shown, text];
            return;
        }
        const resolve = waiting;
        waiting = undefined;
        resolve({ done: false, value: text });
    };
    const next = () => {
        if (off)
            return Promise.resolve(the_end);
        const [first, ...rest] = shown;
        if (first !== undefined) {
            shown = rest;
            return Promise.resolve({ done: false, value: first });
        }
        return new Promise((resolve) => {
            waiting = resolve;
        });
    };
    const texts = {
        [Symbol.asyncIterator]: () => ({
            next,
            return: () => {
                turn_off();
                return Promise.resolve(the_end);
            },
        }),
    };
    return { gives, is_off: () => off, scan: { is: 'on', texts, cameras, turn_off } };
};
/** A camera of test, on a device with the cameras the story gives (one by default). */
export const a_camera_of_test = (cameras = 'one') => {
    let scans = [];
    let facings = [];
    const the_one_on = () => scans.find((one) => !one.is_off());
    return {
        scans: (_video, facing) => {
            facings = [...facings, facing];
            const scan = a_scan_on(cameras);
            scans = [...scans, scan];
            return Promise.resolve(scan.scan);
        },
        shows: (text) => {
            the_one_on()?.gives(text);
        },
        is_on: () => the_one_on() !== undefined,
        turned_on: () => scans.length,
        facings: () => facings,
    };
};
/** A camera the browser refuses. */
export const a_camera_refused = () => Promise.resolve({ is: 'refused' });

// IndexedDB's requests and transactions as promises (WEB-9). A transaction
// commits by itself at the first task with no request of its own pending, so
// that inside one only its own requests are awaited: never a clock, a hash, a
// timer or a call to the library (WEB-9).
/** The result of a request, or its error. */
export const the_result_of = (request) => new Promise((resolve, reject) => {
    request.onsuccess = () => {
        resolve(request.result);
    };
    request.onerror = () => {
        reject(request.error ?? new Error('an IndexedDB request failed'));
    };
});
/** A record read, `unknown` until parsed (the DOM types it `any`). */
export const the_record_of = (request) => the_result_of(request);
/** The records of a range, `unknown` until parsed. */
export const the_records_of = (request) => the_result_of(request);
/** A transaction's end: committed, or aborted with its error. */
export const the_end_of = (transaction) => new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
        resolve();
    };
    transaction.onabort = () => {
        reject(transaction.error ?? new Error('an IndexedDB transaction was aborted'));
    };
});
/** A browser's `QuotaExceededError`: the device has no room for a commit. */
export const no_room = (fault) => fault instanceof Error && fault.name === 'QuotaExceededError';

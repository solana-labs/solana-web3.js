export function getAbortablePromise<T>(promise: Promise<T>, abortSignal?: AbortSignal): Promise<T> {
    if (!abortSignal) {
        return promise;
    } else {
        return Promise.race([
            // This promise only ever rejects if the signal is aborted. Otherwise it idles forever.
            // It's important that this come before the input promise; in the event of an abort, we
            // want to throw even if the input promise's result is ready
            new Promise<never>((_, reject) => {
                if (abortSignal.aborted) {
                    reject(abortSignal.reason);
                } else {
                    abortSignal.addEventListener('abort', function () {
                        reject(this.reason);
                    });
                }
            }),
            promise,
        ]);
    }
}

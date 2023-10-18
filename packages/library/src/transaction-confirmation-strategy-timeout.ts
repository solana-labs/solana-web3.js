type Config = Readonly<{
    abortSignal: AbortSignal;
    timeoutMs: number;
}>;

export async function getTimeoutPromise({ abortSignal: callerAbortSignal, timeoutMs }: Config) {
    return await new Promise((_, reject) => {
        const abortController = new AbortController();
        function handleAbort() {
            clearTimeout(timeoutId);
            abortController.abort();
        }
        callerAbortSignal.addEventListener('abort', handleAbort, { signal: abortController.signal });
        const startMs = performance.now();
        const timeoutId =
            // We use `setTimeout` instead of `AbortSignal.timeout()` because we want to measure
            // elapsed time instead of active time.
            // See https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
            setTimeout(() => {
                const elapsedMs = performance.now() - startMs;
                reject(new DOMException(`Timeout elapsed after ${elapsedMs} ms`, 'TimeoutError'));
            }, timeoutMs);
    });
}

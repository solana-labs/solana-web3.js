import type { Commitment } from '@solana/rpc-types';

type Config = Readonly<{
    abortSignal: AbortSignal;
    commitment: Commitment;
}>;

export async function getTimeoutPromise({ abortSignal: callerAbortSignal, commitment }: Config) {
    return await new Promise((_, reject) => {
        const handleAbort = (e: AbortSignalEventMap['abort']) => {
            clearTimeout(timeoutId);
            const abortError = new DOMException((e.target as AbortSignal).reason, 'AbortError');
            reject(abortError);
        };
        callerAbortSignal.addEventListener('abort', handleAbort);
        const timeoutMs = commitment === 'processed' ? 30_000 : 60_000;
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

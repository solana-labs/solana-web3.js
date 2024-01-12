import type { IRpcTransport } from '@solana/rpc-transport';

type CoalescedRequest = {
    readonly abortController: AbortController;
    numConsumers: number;
    readonly responsePromise: Promise<unknown>;
};

type GetDeduplicationKeyFn = (payload: unknown) => string | undefined;

export function getRpcTransportWithRequestCoalescing(
    transport: IRpcTransport,
    getDeduplicationKey: GetDeduplicationKeyFn,
): IRpcTransport {
    let coalescedRequestsByDeduplicationKey: Record<string, CoalescedRequest> | undefined;
    return async function makeCoalescedHttpRequest<TResponse>(
        config: Parameters<IRpcTransport>[0],
    ): Promise<TResponse> {
        const { payload, signal } = config;
        const deduplicationKey = getDeduplicationKey(payload);
        if (deduplicationKey === undefined) {
            return await transport(config);
        }
        if (!coalescedRequestsByDeduplicationKey) {
            Promise.resolve().then(() => {
                coalescedRequestsByDeduplicationKey = undefined;
            });
            coalescedRequestsByDeduplicationKey = {};
        }
        if (coalescedRequestsByDeduplicationKey[deduplicationKey] == null) {
            const abortController = new AbortController();
            const responsePromise = (async () => {
                try {
                    return await transport<TResponse>({
                        ...config,
                        signal: abortController.signal,
                    });
                } catch (e) {
                    if (e && typeof e === 'object' && 'name' in e && e.name === 'AbortError') {
                        // Ignore `AbortError` thrown from the underlying transport behind which all
                        // requests are coalesced. If it experiences an `AbortError` it is because
                        // we triggered one when the last subscriber aborted. Letting the underlying
                        // transport's `AbortError` bubble up from here would cause runtime fatals
                        // where there should be none.
                        return;
                    }
                    throw e;
                }
            })();
            coalescedRequestsByDeduplicationKey[deduplicationKey] = {
                abortController,
                numConsumers: 0,
                responsePromise,
            };
        }
        const coalescedRequest = coalescedRequestsByDeduplicationKey[deduplicationKey];
        coalescedRequest.numConsumers++;
        if (signal) {
            const responsePromise = coalescedRequest.responsePromise as Promise<TResponse>;
            return await new Promise<TResponse>((resolve, reject) => {
                const handleAbort = (e: AbortSignalEventMap['abort']) => {
                    signal.removeEventListener('abort', handleAbort);
                    coalescedRequest.numConsumers -= 1;
                    if (coalescedRequest.numConsumers === 0) {
                        const abortController = coalescedRequest.abortController;
                        abortController.abort();
                    }
                    const abortError = new DOMException((e.target as AbortSignal).reason, 'AbortError');
                    reject(abortError);
                };
                signal.addEventListener('abort', handleAbort);
                responsePromise.then(resolve).finally(() => {
                    signal.removeEventListener('abort', handleAbort);
                });
            });
        } else {
            return (await coalescedRequest.responsePromise) as TResponse;
        }
    };
}

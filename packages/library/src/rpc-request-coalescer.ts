import { IRpcTransport } from '@solana/rpc-transport/dist/types/transports/transport-types';

type CoalescedRequest = {
    readonly abortController: AbortController;
    numConsumers: number;
    readonly responsePromise: Promise<unknown>;
};

type GetDeduplicationKeyFn = (payload: unknown) => string | undefined;

export function getRpcTransportWithRequestCoalescing(
    transport: IRpcTransport,
    getDeduplicationKey: GetDeduplicationKeyFn
): IRpcTransport {
    let coalescedRequestsByDeduplicationKey: Record<string, CoalescedRequest> | undefined;
    return async function makeCoalescedHttpRequest<TResponse>(
        config: Parameters<IRpcTransport>[0]
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
            coalescedRequestsByDeduplicationKey[deduplicationKey] = {
                abortController,
                numConsumers: 0,
                responsePromise: transport<TResponse>({
                    ...config,
                    signal: abortController.signal,
                }),
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

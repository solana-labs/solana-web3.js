import type { RpcRequest, RpcResponse, RpcTransport } from '@solana/rpc-spec';

type CoalescedRequest = {
    readonly abortController: AbortController;
    numConsumers: number;
    readonly responsePromise: Promise<RpcResponse | undefined>;
};

type GetDeduplicationKeyFn = (request: RpcRequest) => string | undefined;

// This used to be a `Symbol()`, but there's a bug in Node <21 where the `undici` library passes
// the `reason` property of the `AbortSignal` straight to `Error.captureStackTrace()` without first
// typechecking it. `Error.captureStackTrace()` fatals when given a `Symbol`.
// See https://github.com/nodejs/undici/pull/2597
let EXPLICIT_ABORT_TOKEN: ReturnType<typeof createExplicitAbortToken>;
function createExplicitAbortToken() {
    // This function is an annoying workaround to prevent `process.env.NODE_ENV` from appearing at
    // the top level of this module and thwarting an optimizing compiler's attempt to tree-shake.
    return __DEV__
        ? {
              EXPLICIT_ABORT_TOKEN:
                  'This object is thrown from the request that underlies a series of coalesced ' +
                  'requests when the last request in that series aborts',
          }
        : {};
}

export function getRpcTransportWithRequestCoalescing<TTransport extends RpcTransport>(
    transport: TTransport,
    getDeduplicationKey: GetDeduplicationKeyFn,
): TTransport {
    let coalescedRequestsByDeduplicationKey: Record<string, CoalescedRequest> | undefined;
    return async function makeCoalescedHttpRequest<TResponse>(
        request: Parameters<RpcTransport>[0],
    ): Promise<RpcResponse<TResponse>> {
        const { methodName, params, signal } = request;
        const deduplicationKey = getDeduplicationKey({ methodName, params });
        if (deduplicationKey === undefined) {
            return await transport(request);
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
                        ...request,
                        signal: abortController.signal,
                    });
                } catch (e) {
                    if (e === (EXPLICIT_ABORT_TOKEN ||= createExplicitAbortToken())) {
                        // We triggered this error when the last subscriber aborted. Letting this
                        // error bubble up from here would cause runtime fatals where there should
                        // be none.
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
            const responsePromise = coalescedRequest.responsePromise as Promise<RpcResponse<TResponse>>;
            return await new Promise<RpcResponse<TResponse>>((resolve, reject) => {
                const handleAbort = (e: AbortSignalEventMap['abort']) => {
                    signal.removeEventListener('abort', handleAbort);
                    coalescedRequest.numConsumers -= 1;
                    Promise.resolve().then(() => {
                        if (coalescedRequest.numConsumers === 0) {
                            const abortController = coalescedRequest.abortController;
                            abortController.abort((EXPLICIT_ABORT_TOKEN ||= createExplicitAbortToken()));
                        }
                    });
                    reject((e.target as AbortSignal).reason);
                };
                signal.addEventListener('abort', handleAbort);
                responsePromise
                    .then(resolve)
                    .catch(reject)
                    .finally(() => {
                        signal.removeEventListener('abort', handleAbort);
                    });
            });
        } else {
            return (await coalescedRequest.responsePromise) as RpcResponse<TResponse>;
        }
    } as TTransport;
}

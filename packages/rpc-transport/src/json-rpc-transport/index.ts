import { makeHttpRequest } from '../http-request';
import { assertIsAllowedHttpRequestHeaders } from '../http-request-headers';
import { SolanaJsonRpcError } from './json-rpc-errors';
import { createJsonRpcMessage } from './json-rpc-message';
import {
    ArmedBatchTransport,
    ArmedBatchTransportOwnMethods,
    ArmedTransport,
    ArmedTransportOwnMethods,
    SendOptions,
    Transport,
    TransportConfig,
    TransportRequest,
} from './json-rpc-transport-types';

interface IHasIdentifier {
    readonly id: number;
}
type JsonRpcResponse<TResponse> = IHasIdentifier &
    Readonly<{ result: TResponse } | { error: { code: number; message: string; data?: unknown } }>;
type JsonRpcBatchResponse<TResponses extends unknown[]> = [
    ...{ [P in keyof TResponses]: JsonRpcResponse<TResponses[P]> }
];
type TransportRequestBatch<T> = { [P in keyof T]: TransportRequest<T[P]> };

function createArmedJsonRpcTransport<TRpcMethods, TResponse>(
    transportConfig: TransportConfig<TRpcMethods>,
    pendingRequest: TransportRequest<TResponse>
): ArmedTransport<TRpcMethods, TResponse> {
    const overrides = {
        async send(options?: SendOptions): Promise<TResponse> {
            const { methodName, params, responseProcessor } = pendingRequest;
            const payload = createJsonRpcMessage(methodName, params);
            const response = await makeHttpRequest<JsonRpcResponse<unknown>>({
                headers: transportConfig.headers,
                payload,
                signal: options?.abortSignal,
                url: transportConfig.url,
            });
            if ('error' in response) {
                throw new SolanaJsonRpcError(response.error);
            } else {
                return (responseProcessor ? responseProcessor(response.result) : response.result) as TResponse;
            }
        },
    };
    return makeProxy(transportConfig, overrides, pendingRequest);
}

function createArmedBatchJsonRpcTransport<TRpcMethods, TResponses extends unknown[]>(
    transportConfig: TransportConfig<TRpcMethods>,
    pendingRequests: TransportRequestBatch<TResponses>
): ArmedBatchTransport<TRpcMethods, TResponses> {
    const overrides = {
        async sendBatch(options?: SendOptions): Promise<TResponses> {
            const payload = pendingRequests.map(({ methodName, params }) => createJsonRpcMessage(methodName, params));
            const responses = await makeHttpRequest<JsonRpcBatchResponse<unknown[]>>({
                headers: transportConfig.headers,
                payload,
                signal: options?.abortSignal,
                url: transportConfig.url,
            });
            const requestOrder = payload.map(p => p.id);
            return responses
                .sort((a, b) => requestOrder.indexOf(a.id) - requestOrder.indexOf(b.id))
                .map((response, ii) => {
                    if ('error' in response) {
                        throw new SolanaJsonRpcError(response.error);
                    } else {
                        const { responseProcessor } = pendingRequests[ii];
                        return responseProcessor ? responseProcessor(response.result) : response.result;
                    }
                }) as TResponses;
        },
    };
    return makeProxy(transportConfig, overrides, pendingRequests);
}

function makeProxy<TRpcMethods, TResponses extends unknown[]>(
    transportConfig: TransportConfig<TRpcMethods>,
    overrides: ArmedBatchTransportOwnMethods<TResponses>,
    pendingRequests: TransportRequestBatch<TResponses>
): ArmedBatchTransport<TRpcMethods, TResponses>;
function makeProxy<TRpcMethods, TResponse>(
    transportConfig: TransportConfig<TRpcMethods>,
    overrides: ArmedTransportOwnMethods<TResponse>,
    pendingRequest: TransportRequest<TResponse>
): ArmedTransport<TRpcMethods, TResponse>;
function makeProxy<TRpcMethods>(transportConfig: TransportConfig<TRpcMethods>): Transport<TRpcMethods>;
function makeProxy<TRpcMethods, TResponseOrResponses>(
    transportConfig: TransportConfig<TRpcMethods>,
    overrides?: TResponseOrResponses extends unknown[]
        ? ArmedBatchTransportOwnMethods<TResponseOrResponses>
        : ArmedTransportOwnMethods<TResponseOrResponses>,
    pendingRequestOrRequests?: TResponseOrResponses extends unknown[]
        ? TransportRequestBatch<TResponseOrResponses>
        : TransportRequest<TResponseOrResponses>
):
    | Transport<TRpcMethods>
    | (TResponseOrResponses extends unknown[]
          ? ArmedBatchTransport<TRpcMethods, TResponseOrResponses>
          : ArmedTransport<TRpcMethods, TResponseOrResponses>) {
    return new Proxy(transportConfig.api, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get(target, p, receiver) {
            if (overrides && Reflect.has(overrides, p)) {
                return Reflect.get(overrides, p, receiver);
            }
            return function (...rawParams: unknown[]) {
                const methodName = p.toString();
                const createTransportRequest = Reflect.get(target, methodName, receiver);
                const newRequest = createTransportRequest
                    ? createTransportRequest(...rawParams)
                    : { methodName, params: rawParams };
                if (pendingRequestOrRequests == null) {
                    return createArmedJsonRpcTransport(transportConfig, newRequest);
                } else {
                    const nextPendingRequests = Array.isArray(pendingRequestOrRequests)
                        ? [...pendingRequestOrRequests, newRequest]
                        : [pendingRequestOrRequests, newRequest];
                    return createArmedBatchJsonRpcTransport(transportConfig, nextPendingRequests);
                }
            };
        },
    }) as
        | Transport<TRpcMethods>
        | (TResponseOrResponses extends unknown[]
              ? ArmedBatchTransport<TRpcMethods, TResponseOrResponses>
              : ArmedTransport<TRpcMethods, TResponseOrResponses>);
}

export function createJsonRpcTransport<TRpcMethods>(
    transportConfig: TransportConfig<TRpcMethods>
): Transport<TRpcMethods> {
    if (__DEV__ && transportConfig.headers) {
        assertIsAllowedHttpRequestHeaders(transportConfig.headers);
    }
    return makeProxy(transportConfig);
}

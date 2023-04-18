import { SolanaJsonRpcError } from './json-rpc-errors';
import { createJsonRpcMessage } from './json-rpc-message';
import {
    ArmedBatchRpc,
    ArmedBatchRpcOwnMethods,
    ArmedRpc,
    ArmedRpcOwnMethods,
    SendOptions,
    Rpc,
    RpcConfig,
    RpcRequest,
} from './json-rpc-types';

interface IHasIdentifier {
    readonly id: number;
}
type JsonRpcResponse<TResponse> = IHasIdentifier &
    Readonly<{ result: TResponse } | { error: { code: number; message: string; data?: unknown } }>;
type JsonRpcBatchResponse<TResponses extends unknown[]> = [
    ...{ [P in keyof TResponses]: JsonRpcResponse<TResponses[P]> }
];
type RpcRequestBatch<T> = { [P in keyof T]: RpcRequest<T[P]> };

function createArmedJsonRpc<TRpcMethods, TResponse>(
    rpcConfig: RpcConfig<TRpcMethods>,
    pendingRequest: RpcRequest<TResponse>
): ArmedRpc<TRpcMethods, TResponse> {
    const overrides = {
        async send(options?: SendOptions): Promise<TResponse> {
            const { methodName, params, responseProcessor } = pendingRequest;
            const payload = createJsonRpcMessage(methodName, params);
            const response = await rpcConfig.transport<JsonRpcResponse<unknown>>({
                payload,
                signal: options?.abortSignal,
            });
            if ('error' in response) {
                throw new SolanaJsonRpcError(response.error);
            } else {
                return (responseProcessor ? responseProcessor(response.result) : response.result) as TResponse;
            }
        },
    };
    return makeProxy(rpcConfig, overrides, pendingRequest);
}

function createArmedBatchJsonRpc<TRpcMethods, TResponses extends unknown[]>(
    rpcConfig: RpcConfig<TRpcMethods>,
    pendingRequests: RpcRequestBatch<TResponses>
): ArmedBatchRpc<TRpcMethods, TResponses> {
    const overrides = {
        async sendBatch(options?: SendOptions): Promise<TResponses> {
            const payload = pendingRequests.map(({ methodName, params }) => createJsonRpcMessage(methodName, params));
            const responses = await rpcConfig.transport<JsonRpcBatchResponse<unknown[]>>({
                payload,
                signal: options?.abortSignal,
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
    return makeProxy(rpcConfig, overrides, pendingRequests);
}

function makeProxy<TRpcMethods, TResponses extends unknown[]>(
    rpcConfig: RpcConfig<TRpcMethods>,
    overrides: ArmedBatchRpcOwnMethods<TResponses>,
    pendingRequests: RpcRequestBatch<TResponses>
): ArmedBatchRpc<TRpcMethods, TResponses>;
function makeProxy<TRpcMethods, TResponse>(
    rpcConfig: RpcConfig<TRpcMethods>,
    overrides: ArmedRpcOwnMethods<TResponse>,
    pendingRequest: RpcRequest<TResponse>
): ArmedRpc<TRpcMethods, TResponse>;
function makeProxy<TRpcMethods>(rpcConfig: RpcConfig<TRpcMethods>): Rpc<TRpcMethods>;
function makeProxy<TRpcMethods, TResponseOrResponses>(
    rpcConfig: RpcConfig<TRpcMethods>,
    overrides?: TResponseOrResponses extends unknown[]
        ? ArmedBatchRpcOwnMethods<TResponseOrResponses>
        : ArmedRpcOwnMethods<TResponseOrResponses>,
    pendingRequestOrRequests?: TResponseOrResponses extends unknown[]
        ? RpcRequestBatch<TResponseOrResponses>
        : RpcRequest<TResponseOrResponses>
):
    | Rpc<TRpcMethods>
    | (TResponseOrResponses extends unknown[]
          ? ArmedBatchRpc<TRpcMethods, TResponseOrResponses>
          : ArmedRpc<TRpcMethods, TResponseOrResponses>) {
    return new Proxy(rpcConfig.api, {
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
                const createRpcRequest = Reflect.get(target, methodName, receiver);
                const newRequest = createRpcRequest
                    ? createRpcRequest(...rawParams)
                    : { methodName, params: rawParams };
                if (pendingRequestOrRequests == null) {
                    return createArmedJsonRpc(rpcConfig, newRequest);
                } else {
                    const nextPendingRequests = Array.isArray(pendingRequestOrRequests)
                        ? [...pendingRequestOrRequests, newRequest]
                        : [pendingRequestOrRequests, newRequest];
                    return createArmedBatchJsonRpc(rpcConfig, nextPendingRequests);
                }
            };
        },
    }) as
        | Rpc<TRpcMethods>
        | (TResponseOrResponses extends unknown[]
              ? ArmedBatchRpc<TRpcMethods, TResponseOrResponses>
              : ArmedRpc<TRpcMethods, TResponseOrResponses>);
}

export function createJsonRpc<TRpcMethods>(rpcConfig: RpcConfig<TRpcMethods>): Rpc<TRpcMethods> {
    return makeProxy(rpcConfig);
}

import { PendingRpcRequest, Rpc, RpcRequest, SendOptions } from '@solana/rpc-types';

import { RpcConfig } from './json-rpc-config';
import { SolanaJsonRpcError } from './json-rpc-errors';
import { createJsonRpcMessage } from './json-rpc-message';

interface IHasIdentifier {
    readonly id: number;
}
export type JsonRpcResponse<TResponse> = IHasIdentifier &
    Readonly<{ result: TResponse } | { error: { code: number; message: string; data?: unknown } }>;

function createPendingRpcRequest<TRpcMethods, TResponse>(
    rpcConfig: RpcConfig<TRpcMethods>,
    pendingRequest: RpcRequest<TResponse>,
): PendingRpcRequest<TResponse> {
    return {
        async send(options?: SendOptions): Promise<TResponse> {
            const { methodName, params, responseTransformer } = pendingRequest;
            const payload = createJsonRpcMessage(methodName, params);
            const response = await rpcConfig.transport<JsonRpcResponse<unknown>>({
                payload,
                signal: options?.abortSignal,
            });
            if ('error' in response) {
                throw new SolanaJsonRpcError(response.error);
            } else {
                return (
                    responseTransformer ? responseTransformer(response.result, methodName) : response.result
                ) as TResponse;
            }
        },
    };
}

function makeProxy<TRpcMethods>(rpcConfig: RpcConfig<TRpcMethods>): Rpc<TRpcMethods> {
    return new Proxy(rpcConfig.api, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get(target, p, receiver) {
            return function (...rawParams: unknown[]) {
                const methodName = p.toString();
                const createRpcRequest = Reflect.get(target, methodName, receiver);
                const newRequest = createRpcRequest
                    ? createRpcRequest(...rawParams)
                    : { methodName, params: rawParams };
                return createPendingRpcRequest(rpcConfig, newRequest);
            };
        },
    }) as Rpc<TRpcMethods>;
}

export function createJsonRpc<TRpcMethods>(rpcConfig: RpcConfig<TRpcMethods>): Rpc<TRpcMethods> {
    return makeProxy(rpcConfig);
}

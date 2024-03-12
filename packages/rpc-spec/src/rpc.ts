import { getSolanaErrorFromJsonRpcError } from '@solana/errors';
import {
    Callable,
    createRpcMessage,
    Flatten,
    OverloadImplementations,
    RpcResponse,
    UnionToIntersection,
} from '@solana/rpc-spec-types';

import { RpcApi } from './rpc-api';
import { PendingRpcRequest, RpcRequest, RpcSendOptions } from './rpc-request';
import { RpcTransport } from './rpc-transport';

export type RpcConfig<TRpcMethods, TRpcTransport extends RpcTransport> = Readonly<{
    api: RpcApi<TRpcMethods>;
    transport: TRpcTransport;
}>;

export type Rpc<TRpcMethods> = {
    [TMethodName in keyof TRpcMethods]: PendingRpcRequestBuilder<OverloadImplementations<TRpcMethods, TMethodName>>;
};

type PendingRpcRequestBuilder<TMethodImplementations> = UnionToIntersection<
    Flatten<{
        [P in keyof TMethodImplementations]: PendingRpcRequestReturnTypeMapper<TMethodImplementations[P]>;
    }>
>;

type PendingRpcRequestReturnTypeMapper<TMethodImplementation> =
    // Check that this property of the TRpcMethods interface is, in fact, a function.
    TMethodImplementation extends Callable
        ? (...args: Parameters<TMethodImplementation>) => PendingRpcRequest<ReturnType<TMethodImplementation>>
        : never;

export function createRpc<TRpcMethods, TRpcTransport extends RpcTransport>(
    rpcConfig: RpcConfig<TRpcMethods, TRpcTransport>,
): Rpc<TRpcMethods> {
    return makeProxy(rpcConfig) as Rpc<TRpcMethods>;
}

function makeProxy<TRpcMethods, TRpcTransport extends RpcTransport>(
    rpcConfig: RpcConfig<TRpcMethods, TRpcTransport>,
): Rpc<TRpcMethods> {
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

function createPendingRpcRequest<TRpcMethods, TRpcTransport extends RpcTransport, TResponse>(
    rpcConfig: RpcConfig<TRpcMethods, TRpcTransport>,
    pendingRequest: RpcRequest<TResponse>,
): PendingRpcRequest<TResponse> {
    return {
        async send(options?: RpcSendOptions): Promise<TResponse> {
            const { methodName, params, responseTransformer } = pendingRequest;
            const payload = createRpcMessage(methodName, params);
            const response = await rpcConfig.transport<RpcResponse<unknown>>({
                payload,
                signal: options?.abortSignal,
            });
            if ('error' in response) {
                throw getSolanaErrorFromJsonRpcError(response.error);
            }
            return (
                responseTransformer ? responseTransformer(response.result, methodName) : response.result
            ) as TResponse;
        },
    };
}

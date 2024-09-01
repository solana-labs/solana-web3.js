import {
    Callable,
    createRpcMessage,
    Flatten,
    OverloadImplementations,
    UnionToIntersection,
} from '@solana/rpc-spec-types';

import { RpcApi, RpcApiRequestPlan } from './rpc-api';
import { RpcTransport } from './rpc-transport';

export type RpcConfig<TRpcMethods, TRpcTransport extends RpcTransport> = Readonly<{
    api: RpcApi<TRpcMethods>;
    transport: TRpcTransport;
}>;

export type Rpc<TRpcMethods> = {
    [TMethodName in keyof TRpcMethods]: PendingRpcRequestBuilder<OverloadImplementations<TRpcMethods, TMethodName>>;
};

export type PendingRpcRequest<TResponse> = {
    send(options?: RpcSendOptions): Promise<TResponse>;
};

export type RpcSendOptions = Readonly<{
    abortSignal?: AbortSignal;
}>;

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
    pendingRequest: RpcApiRequestPlan<TResponse>,
): PendingRpcRequest<TResponse> {
    return {
        async send(options?: RpcSendOptions): Promise<TResponse> {
            const { methodName, params, responseTransformer } = pendingRequest;
            const request = Object.freeze({ methodName, params });
            const rawResponse = await rpcConfig.transport<TResponse>({
                payload: createRpcMessage(methodName, params),
                signal: options?.abortSignal,
            });
            return responseTransformer ? responseTransformer(rawResponse, request) : rawResponse;
        },
    };
}

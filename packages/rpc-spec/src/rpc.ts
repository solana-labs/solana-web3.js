import { SOLANA_ERROR__RPC__API_PLAN_MISSING_FOR_RPC_METHOD, SolanaError } from '@solana/errors';
import { Callable, Flatten, OverloadImplementations, UnionToIntersection } from '@solana/rpc-spec-types';

import { RpcApi, RpcPlan } from './rpc-api';
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
    return makeProxy(rpcConfig);
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
                const getApiPlan = Reflect.get(target, methodName, receiver);
                if (!getApiPlan) {
                    throw new SolanaError(SOLANA_ERROR__RPC__API_PLAN_MISSING_FOR_RPC_METHOD, {
                        method: methodName,
                        params: rawParams,
                    });
                }
                const apiPlan = getApiPlan(...rawParams);
                return createPendingRpcRequest(rpcConfig, apiPlan);
            };
        },
    }) as Rpc<TRpcMethods>;
}

function createPendingRpcRequest<TRpcMethods, TRpcTransport extends RpcTransport, TResponse>(
    { transport }: RpcConfig<TRpcMethods, TRpcTransport>,
    plan: RpcPlan<TResponse>,
): PendingRpcRequest<TResponse> {
    return {
        async send(options?: RpcSendOptions): Promise<TResponse> {
            return await plan.execute({ signal: options?.abortSignal, transport });
        },
    };
}

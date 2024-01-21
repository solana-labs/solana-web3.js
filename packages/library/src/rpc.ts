import { pipe } from '@solana/functional';
import {
    createSolanaRpcApi,
    createSolanaRpcSubscriptionsApi,
    createSolanaRpcSubscriptionsApi_UNSTABLE,
    SolanaRpcMethodsFromTransport,
    SolanaRpcSubscriptions,
    SolanaRpcSubscriptionsUnstable,
} from '@solana/rpc-core';
import {
    createJsonRpc,
    createJsonSubscriptionRpc,
    IRpcTransport,
    IRpcTransportWithCluster,
    IRpcWebSocketTransport,
    IRpcWebSocketTransportWithCluster,
    RpcFromTransport,
    RpcSubscriptionsFromTransport,
} from '@solana/rpc-transport';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';

import { DEFAULT_RPC_CONFIG } from './rpc-default-config';
import { getRpcSubscriptionsWithSubscriptionCoalescing } from './rpc-subscription-coalescer';

type RpcConfig<TTransport extends IRpcTransport | IRpcTransportWithCluster> = Readonly<{
    transport: TTransport;
}>;

export function createSolanaRpc<TTransport extends IRpcTransport | IRpcTransportWithCluster>(
    config: RpcConfig<TTransport>,
): RpcFromTransport<SolanaRpcMethodsFromTransport<TTransport>, TTransport> {
    const api = createSolanaRpcApi<SolanaRpcMethodsFromTransport<TTransport>>(DEFAULT_RPC_CONFIG);
    return createJsonRpc({
        ...config,
        api,
    }) as RpcFromTransport<SolanaRpcMethodsFromTransport<TTransport>, TTransport>;
}

type RpcSubscriptionsConfig<TTransport extends IRpcWebSocketTransport | IRpcWebSocketTransportWithCluster> = Readonly<{
    transport: TTransport;
}>;

export function createSolanaRpcSubscriptions<
    TTransport extends IRpcWebSocketTransport | IRpcWebSocketTransportWithCluster,
>(config: RpcSubscriptionsConfig<TTransport>): RpcSubscriptionsFromTransport<SolanaRpcSubscriptions, TTransport> {
    return pipe(
        createJsonSubscriptionRpc({
            ...config,
            api: createSolanaRpcSubscriptionsApi(DEFAULT_RPC_CONFIG),
        }),
        rpcSubscriptions =>
            getRpcSubscriptionsWithSubscriptionCoalescing({
                getDeduplicationKey: (...args) => fastStableStringify(args),
                rpcSubscriptions,
            }),
    ) as RpcSubscriptionsFromTransport<SolanaRpcSubscriptions, TTransport>;
}

export function createSolanaRpcSubscriptions_UNSTABLE<
    TTransport extends IRpcWebSocketTransport | IRpcWebSocketTransportWithCluster,
>(
    config: RpcSubscriptionsConfig<TTransport>,
): RpcSubscriptionsFromTransport<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable, TTransport> {
    return createJsonSubscriptionRpc({
        ...config,
        api: createSolanaRpcSubscriptionsApi_UNSTABLE(DEFAULT_RPC_CONFIG),
    }) as RpcSubscriptionsFromTransport<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable, TTransport>;
}

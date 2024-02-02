import { pipe } from '@solana/functional';
import {
    createSolanaRpcApi,
    createSolanaRpcSubscriptionsApi,
    createSolanaRpcSubscriptionsApi_UNSTABLE,
    SolanaRpcMethodsFromTransport,
    SolanaRpcSubscriptions,
    SolanaRpcSubscriptionsUnstable,
} from '@solana/rpc-core';
import { createJsonRpc, createJsonSubscriptionRpc, IRpcTransport, type RpcFromTransport } from '@solana/rpc-transport';
import { IRpcTransportWithCluster } from '@solana/rpc-transport/dist/types/transports/transport-types';
import type { RpcSubscriptions } from '@solana/rpc-types';
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

export function createSolanaRpcSubscriptions(
    config: Omit<Parameters<typeof createJsonSubscriptionRpc>[0], 'api'>,
): RpcSubscriptions<SolanaRpcSubscriptions> {
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
    );
}

export function createSolanaRpcSubscriptions_UNSTABLE(
    config: Omit<Parameters<typeof createJsonSubscriptionRpc>[0], 'api'>,
): RpcSubscriptions<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable> {
    return createJsonSubscriptionRpc({
        ...config,
        api: createSolanaRpcSubscriptionsApi_UNSTABLE(DEFAULT_RPC_CONFIG),
    });
}

import { pipe } from '@solana/functional';
import type { SolanaRpcSubscriptionsApi, SolanaRpcSubscriptionsApiUnstable } from '@solana/rpc-subscriptions-api';
import { createSolanaRpcSubscriptionsApi } from '@solana/rpc-subscriptions-api';
import {
    createSubscriptionRpc,
    RpcSubscriptionsApiMethods,
    type RpcSubscriptionsTransport,
} from '@solana/rpc-subscriptions-spec';
import { ClusterUrl } from '@solana/rpc-types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';

import { DEFAULT_RPC_CONFIG } from './rpc-default-config';
import type { RpcSubscriptionsFromTransport } from './rpc-subscriptions-clusters';
import { getRpcSubscriptionsWithSubscriptionCoalescing } from './rpc-subscriptions-coalescer';
import {
    createDefaultRpcSubscriptionsTransport,
    DefaultRpcSubscriptionsTransportConfig,
} from './rpc-subscriptions-transport';

export function createSolanaRpcSubscriptions<
    TClusterUrl extends ClusterUrl,
    TApi extends RpcSubscriptionsApiMethods = SolanaRpcSubscriptionsApi,
>(clusterUrl: TClusterUrl, config?: Omit<DefaultRpcSubscriptionsTransportConfig<TClusterUrl>, 'url'>) {
    const transport = createDefaultRpcSubscriptionsTransport({ url: clusterUrl, ...config });
    return createSolanaRpcSubscriptionsFromTransport<typeof transport, TApi>(transport);
}

export function createSolanaRpcSubscriptions_UNSTABLE<TClusterUrl extends ClusterUrl>(
    clusterUrl: TClusterUrl,
    config?: Omit<DefaultRpcSubscriptionsTransportConfig<TClusterUrl>, 'url'>,
) {
    return createSolanaRpcSubscriptions<TClusterUrl, SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>(
        clusterUrl,
        config,
    );
}

export function createSolanaRpcSubscriptionsFromTransport<
    TTransport extends RpcSubscriptionsTransport,
    TApi extends RpcSubscriptionsApiMethods = SolanaRpcSubscriptionsApi,
>(transport: TTransport) {
    return pipe(
        createSubscriptionRpc({
            api: createSolanaRpcSubscriptionsApi<TApi>(DEFAULT_RPC_CONFIG),
            transport,
        }),
        rpcSubscriptions =>
            getRpcSubscriptionsWithSubscriptionCoalescing({
                getDeduplicationKey: (...args) => fastStableStringify(args),
                rpcSubscriptions,
            }),
    ) as RpcSubscriptionsFromTransport<TApi, TTransport>;
}

export function createSolanaRpcSubscriptionsFromTransport_UNSTABLE<TTransport extends RpcSubscriptionsTransport>(
    transport: TTransport,
) {
    return createSolanaRpcSubscriptionsFromTransport<
        TTransport,
        SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
    >(transport);
}

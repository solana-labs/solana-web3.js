import type { SolanaRpcSubscriptionsApi, SolanaRpcSubscriptionsApiUnstable } from '@solana/rpc-subscriptions-api';
import { createSolanaRpcSubscriptionsApi } from '@solana/rpc-subscriptions-api';
import {
    createSubscriptionRpc,
    RpcSubscriptionsApiMethods,
    type RpcSubscriptionsTransport,
} from '@solana/rpc-subscriptions-spec';
import { ClusterUrl } from '@solana/rpc-types';

import { DEFAULT_RPC_SUBSCRIPTIONS_CONFIG } from './rpc-default-config';
import type { RpcSubscriptionsFromTransport } from './rpc-subscriptions-clusters';
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
    return createSubscriptionRpc({
        api: createSolanaRpcSubscriptionsApi<TApi>(DEFAULT_RPC_SUBSCRIPTIONS_CONFIG),
        transport,
    }) as RpcSubscriptionsFromTransport<TApi, TTransport>;
}

export function createSolanaRpcSubscriptionsFromTransport_UNSTABLE<TTransport extends RpcSubscriptionsTransport>(
    transport: TTransport,
) {
    return createSolanaRpcSubscriptionsFromTransport<
        TTransport,
        SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
    >(transport);
}

import type { SolanaRpcSubscriptionsApi, SolanaRpcSubscriptionsApiUnstable } from '@solana/rpc-subscriptions-api';
import { createSolanaRpcSubscriptionsApi } from '@solana/rpc-subscriptions-api';
import {
    createSubscriptionRpc,
    RpcSubscriptionsApiMethods,
    type RpcSubscriptionsTransport,
} from '@solana/rpc-subscriptions-spec';
import { ClusterUrl } from '@solana/rpc-types';

import { DEFAULT_RPC_SUBSCRIPTIONS_CONFIG } from './rpc-default-config';
import {
    createDefaultRpcSubscriptionsChannelCreator,
    DefaultRpcSubscriptionsChannelConfig,
} from './rpc-subscriptions-channel';
import type { RpcSubscriptionsFromTransport } from './rpc-subscriptions-clusters';
import {
    createDefaultRpcSubscriptionsTransport,
    DefaultRpcSubscriptionsTransportConfig,
} from './rpc-subscriptions-transport';

interface DefaultRpcSubscriptionsConfig<TClusterUrl extends ClusterUrl>
    extends DefaultRpcSubscriptionsTransportConfig<TClusterUrl>,
        DefaultRpcSubscriptionsChannelConfig<TClusterUrl> {}

function createSolanaRpcSubscriptionsImpl<TClusterUrl extends ClusterUrl, TApi extends RpcSubscriptionsApiMethods>(
    clusterUrl: TClusterUrl,
    config?: Omit<DefaultRpcSubscriptionsConfig<TClusterUrl>, 'url'>,
) {
    const transport = createDefaultRpcSubscriptionsTransport({
        createChannel: createDefaultRpcSubscriptionsChannelCreator({ ...config, url: clusterUrl }),
    });
    return createSolanaRpcSubscriptionsFromTransport<typeof transport, TApi>(transport);
}

export function createSolanaRpcSubscriptions<TClusterUrl extends ClusterUrl>(
    clusterUrl: TClusterUrl,
    config?: Omit<DefaultRpcSubscriptionsConfig<TClusterUrl>, 'url'>,
) {
    return createSolanaRpcSubscriptionsImpl<TClusterUrl, SolanaRpcSubscriptionsApi>(clusterUrl, config);
}

export function createSolanaRpcSubscriptions_UNSTABLE<TClusterUrl extends ClusterUrl>(
    clusterUrl: TClusterUrl,
    config?: Omit<DefaultRpcSubscriptionsTransportConfig<TClusterUrl>, 'url'>,
) {
    return createSolanaRpcSubscriptionsImpl<TClusterUrl, SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>(
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

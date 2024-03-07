import { pipe } from '@solana/functional';
import { createWebSocketTransport } from '@solana/rpc-subscriptions-transport-websocket';
import type { ClusterUrl } from '@solana/rpc-types';

import { getWebSocketTransportWithAutoping } from './rpc-subscriptions-autopinger';
import { RpcSubscriptionsTransportFromClusterUrl } from './rpc-subscriptions-clusters';
import { getWebSocketTransportWithConnectionSharding } from './rpc-subscriptions-connection-sharding';

export type DefaultRpcSubscriptionsTransportConfig<TClusterUrl extends ClusterUrl> = Readonly<{
    /**
     * You might like to open more subscriptions per connection than your RPC provider allows
     * for. Using the initial payload as input, return a shard key from this method to assign
     * subscriptions to separate connections. One socket will be opened per shard key.
     */
    getShard?: (payload: unknown) => string;
    intervalMs?: number;
    sendBufferHighWatermark?: number;
    url: TClusterUrl;
}>;

export function createDefaultRpcSubscriptionsTransport<TClusterUrl extends ClusterUrl>(
    config: DefaultRpcSubscriptionsTransportConfig<TClusterUrl>,
): RpcSubscriptionsTransportFromClusterUrl<TClusterUrl> {
    const { getShard, intervalMs, ...rest } = config;
    return pipe(
        createWebSocketTransport({
            ...rest,
            sendBufferHighWatermark:
                config.sendBufferHighWatermark ??
                // Let 128KB of data into the WebSocket buffer before buffering it in the app.
                131_072,
        }) as RpcSubscriptionsTransportFromClusterUrl<TClusterUrl>,
        transport =>
            getWebSocketTransportWithAutoping({
                intervalMs: intervalMs ?? 5_000,
                transport,
            }),
        transport =>
            getWebSocketTransportWithConnectionSharding({
                getShard,
                transport,
            }),
    );
}

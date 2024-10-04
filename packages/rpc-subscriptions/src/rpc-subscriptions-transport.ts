import { createWebSocketTransport } from '@solana/rpc-subscriptions-transport-websocket';
import type { ClusterUrl } from '@solana/rpc-types';

import { RpcSubscriptionsTransportFromClusterUrl } from './rpc-subscriptions-clusters';

export type DefaultRpcSubscriptionsTransportConfig<TClusterUrl extends ClusterUrl> = Readonly<{
    intervalMs?: number;
    sendBufferHighWatermark?: number;
    url: TClusterUrl;
}>;

export function createDefaultRpcSubscriptionsTransport<TClusterUrl extends ClusterUrl>(
    config: DefaultRpcSubscriptionsTransportConfig<TClusterUrl>,
): RpcSubscriptionsTransportFromClusterUrl<TClusterUrl> {
    const { /* `intervalMs` will make a comeback; stay tuned */ ...rest } = config;
    return createWebSocketTransport({
        ...rest,
        sendBufferHighWatermark:
            config.sendBufferHighWatermark ??
            // Let 128KB of data into the WebSocket buffer before buffering it in the app.
            131_072,
    }) as RpcSubscriptionsTransportFromClusterUrl<TClusterUrl>;
}

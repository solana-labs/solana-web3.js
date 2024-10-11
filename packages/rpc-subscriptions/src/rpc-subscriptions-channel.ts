import { createWebSocketChannel } from '@solana/rpc-subscriptions-channel-websocket';
import type { ClusterUrl } from '@solana/rpc-types';

import { getRpcSubscriptionsChannelWithAutoping } from './rpc-subscriptions-autopinger';
import { getChannelPoolingChannelCreator } from './rpc-subscriptions-channel-pool';
import { RpcSubscriptionsChannelCreatorFromClusterUrl } from './rpc-subscriptions-clusters';
import { getRpcSubscriptionsChannelWithJSONSerialization } from './rpc-subscriptions-json';

export type DefaultRpcSubscriptionsChannelConfig<TClusterUrl extends ClusterUrl> = Readonly<{
    intervalMs?: number;
    maxSubscriptionsPerChannel?: number;
    minChannels?: number;
    sendBufferHighWatermark?: number;
    url: TClusterUrl;
}>;

export function createDefaultRpcSubscriptionsChannelCreator<TClusterUrl extends ClusterUrl>(
    config: DefaultRpcSubscriptionsChannelConfig<TClusterUrl>,
): RpcSubscriptionsChannelCreatorFromClusterUrl<TClusterUrl, unknown, unknown> {
    if (/^wss?:/i.test(config.url) === false) {
        const protocolMatch = config.url.match(/^([^:]+):/);
        throw new DOMException(
            protocolMatch
                ? "Failed to construct 'WebSocket': The URL's scheme must be either 'ws' or " +
                  `'wss'. '${protocolMatch[1]}:' is not allowed.`
                : `Failed to construct 'WebSocket': The URL '${config.url}' is invalid.`,
        );
    }
    const { intervalMs, ...rest } = config;
    const createDefaultRpcSubscriptionsChannel = (({ abortSignal }) => {
        return createWebSocketChannel({
            ...rest,
            sendBufferHighWatermark:
                config.sendBufferHighWatermark ??
                // Let 128KB of data into the WebSocket buffer before buffering it in the app.
                131_072,
            signal: abortSignal,
        })
            .then(getRpcSubscriptionsChannelWithJSONSerialization)
            .then(channel =>
                getRpcSubscriptionsChannelWithAutoping({
                    abortSignal,
                    channel,
                    intervalMs: intervalMs ?? 5_000,
                }),
            );
    }) as RpcSubscriptionsChannelCreatorFromClusterUrl<TClusterUrl, unknown, unknown>;
    return getChannelPoolingChannelCreator(createDefaultRpcSubscriptionsChannel, {
        maxSubscriptionsPerChannel:
            config.maxSubscriptionsPerChannel ??
            // TODO: Determine this experimentally
            1_000,
        minChannels: config.minChannels ?? 1,
    });
}

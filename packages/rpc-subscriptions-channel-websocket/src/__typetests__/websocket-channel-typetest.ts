/* eslint-disable @typescript-eslint/no-floating-promises */

import { RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';

import { createWebSocketChannel } from '../websocket-channel';

const config = {
    sendBufferHighWatermark: 0,
    signal: AbortSignal.any([]),
    url: 'ws://localhost:8899',
};

// [DESCRIBE] createWebSocketChannel
{
    // It creates a channel that takes in a `WebSocketMessage` and produces a stream of `string`
    {
        createWebSocketChannel(config) satisfies Promise<
            RpcSubscriptionsChannel<ArrayBufferLike | ArrayBufferView | Blob | string, string>
        >;
    }
}

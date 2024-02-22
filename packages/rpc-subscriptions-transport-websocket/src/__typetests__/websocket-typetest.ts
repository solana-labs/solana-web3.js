import { RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';

import { createWebSocketTransport } from '../websocket-transport';

const config = { sendBufferHighWatermark: 0, url: 'ws://localhost:8899' };

createWebSocketTransport(config) satisfies RpcSubscriptionsTransport;

import { createSubscriptionRpc, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import { createWebSocketTransport } from '@solana/rpc-subscriptions-transport-websocket';

import {
    createSolanaRpcSubscriptionsApi_UNSTABLE,
    SolanaRpcSubscriptionsApi,
    SolanaRpcSubscriptionsApiUnstable,
} from '..';

export function createLocalhostSolanaRpcSubscriptions(): RpcSubscriptions<
    SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
> {
    return createSubscriptionRpc({
        api: createSolanaRpcSubscriptionsApi_UNSTABLE(),
        transport: createWebSocketTransport({
            sendBufferHighWatermark: Number.POSITIVE_INFINITY,
            url: 'ws://127.0.0.1:8900',
        }),
    });
}

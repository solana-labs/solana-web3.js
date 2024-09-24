import { createWebSocketChannel } from '@solana/rpc-subscriptions-channel-websocket';
import { createSubscriptionRpc, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';

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
        async transport({ executeSubscriptionPlan, signal }) {
            const channel = await createWebSocketChannel({
                sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                signal,
                url: 'ws://127.0.0.1:8900',
            });
            return await executeSubscriptionPlan({ channel, signal });
        },
    });
}

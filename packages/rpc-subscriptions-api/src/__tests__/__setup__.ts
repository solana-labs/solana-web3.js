import { createWebSocketChannel } from '@solana/rpc-subscriptions-channel-websocket';
import { createSubscriptionRpc, RpcSubscriptions, RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';

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
        async transport({ execute, signal }) {
            const webSocketChannel = await createWebSocketChannel({
                sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                signal,
                url: 'ws://127.0.0.1:8900',
            });
            const channel = {
                ...webSocketChannel,
                on(type, listener, options) {
                    if (type !== 'message') {
                        return webSocketChannel.on(type, listener, options);
                    }
                    return webSocketChannel.on(
                        'message',
                        function deserializingListener(message: string) {
                            const deserializedMessage = JSON.parse(message);
                            listener(deserializedMessage);
                        },
                        options,
                    );
                },
                send(message) {
                    const serializedMessage = JSON.stringify(message);
                    return webSocketChannel.send(serializedMessage);
                },
            } as RpcSubscriptionsChannel<unknown, unknown>;
            return await execute({ channel, signal });
        },
    });
}

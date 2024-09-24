import { RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';

export function getRpcSubscriptionsChannelWithJSONSerialization(
    channel: RpcSubscriptionsChannel<string, string>,
): RpcSubscriptionsChannel<unknown, unknown> {
    return {
        ...channel,
        on(type, listener, options) {
            if (type !== 'message') {
                return channel.on(type, listener, options);
            }
            return channel.on(
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
            return channel.send(serializedMessage);
        },
    };
}

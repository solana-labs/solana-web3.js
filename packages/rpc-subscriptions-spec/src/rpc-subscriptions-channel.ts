import {
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CLOSED_BEFORE_MESSAGE_BUFFERED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_FAILED_TO_CONNECT,
    SolanaError,
} from '@solana/errors';
import { DataPublisher } from '@solana/subscribable';

type RpcSubscriptionsChannelSolanaErrorCode =
    | typeof SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CLOSED_BEFORE_MESSAGE_BUFFERED
    | typeof SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED
    | typeof SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_FAILED_TO_CONNECT;

export type RpcSubscriptionChannelEvents<TInboundMessage> = {
    error: SolanaError<RpcSubscriptionsChannelSolanaErrorCode>;
    message: TInboundMessage;
};

export interface RpcSubscriptionsChannel<TOutboundMessage, TInboundMessage>
    extends DataPublisher<RpcSubscriptionChannelEvents<TInboundMessage>> {
    send(message: TOutboundMessage): Promise<void>;
}

export type RpcSubscriptionsChannelCreator<TOutboundMessage, TInboundMessage> = (
    config: Readonly<{
        abortSignal: AbortSignal;
    }>,
) => Promise<RpcSubscriptionsChannel<TOutboundMessage, TInboundMessage>>;

export function transformChannelInboundMessages<TOutboundMessage, TNewInboundMessage, TInboundMessage>(
    channel: RpcSubscriptionsChannel<TOutboundMessage, TInboundMessage>,
    transform: (message: TInboundMessage) => TNewInboundMessage,
): RpcSubscriptionsChannel<TOutboundMessage, TNewInboundMessage> {
    return Object.freeze<RpcSubscriptionsChannel<TOutboundMessage, TNewInboundMessage>>({
        ...channel,
        on(type, subscriber, options) {
            if (type !== 'message') {
                return channel.on(
                    type,
                    subscriber as (data: RpcSubscriptionChannelEvents<TInboundMessage>[typeof type]) => void,
                    options,
                );
            }
            return channel.on(
                'message',
                message => (subscriber as (data: TNewInboundMessage) => void)(transform(message)),
                options,
            );
        },
    });
}

export function transformChannelOutboundMessages<TNewOutboundMessage, TOutboundMessage, TInboundMessage>(
    channel: RpcSubscriptionsChannel<TOutboundMessage, TInboundMessage>,
    transform: (message: TNewOutboundMessage) => TOutboundMessage,
): RpcSubscriptionsChannel<TNewOutboundMessage, TInboundMessage> {
    return Object.freeze<RpcSubscriptionsChannel<TNewOutboundMessage, TInboundMessage>>({
        ...channel,
        send: message => channel.send(transform(message)),
    });
}

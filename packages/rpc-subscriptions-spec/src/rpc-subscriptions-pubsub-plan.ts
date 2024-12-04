import {
    getSolanaErrorFromJsonRpcError,
    SOLANA_ERROR__INVARIANT_VIOLATION__DATA_PUBLISHER_CHANNEL_UNIMPLEMENTED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID,
    SolanaError,
} from '@solana/errors';
import { AbortController } from '@solana/event-target-impl';
import { safeRace } from '@solana/promises';
import { createRpcMessage, RpcRequest, RpcResponseData, RpcResponseTransformer } from '@solana/rpc-spec-types';
import { DataPublisher } from '@solana/subscribable';
import { demultiplexDataPublisher } from '@solana/subscribable';

import { RpcSubscriptionChannelEvents } from './rpc-subscriptions-channel';
import { RpcSubscriptionsChannel } from './rpc-subscriptions-channel';

type Config<TNotification> = Readonly<{
    channel: RpcSubscriptionsChannel<unknown, RpcNotification<TNotification> | RpcResponseData<RpcSubscriptionId>>;
    responseTransformer?: RpcResponseTransformer;
    signal: AbortSignal;
    subscribeRequest: RpcRequest;
    unsubscribeMethodName: string;
}>;

type RpcNotification<TNotification> = Readonly<{
    method: string;
    params: Readonly<{
        result: TNotification;
        subscription: number;
    }>;
}>;

type RpcSubscriptionId = number;

type RpcSubscriptionNotificationEvents<TNotification> = Omit<RpcSubscriptionChannelEvents<TNotification>, 'message'> & {
    notification: TNotification;
};

const subscriberCountBySubscriptionIdByChannel = new WeakMap<WeakKey, Record<number, number>>();
function decrementSubscriberCountAndReturnNewCount(channel: WeakKey, subscriptionId?: number): number | undefined {
    return augmentSubscriberCountAndReturnNewCount(-1, channel, subscriptionId);
}
function incrementSubscriberCount(channel: WeakKey, subscriptionId?: number): void {
    augmentSubscriberCountAndReturnNewCount(1, channel, subscriptionId);
}
function augmentSubscriberCountAndReturnNewCount(
    amount: -1 | 1,
    channel: WeakKey,
    subscriptionId?: number,
): number | undefined {
    if (subscriptionId === undefined) {
        return;
    }
    let subscriberCountBySubscriptionId = subscriberCountBySubscriptionIdByChannel.get(channel);
    if (!subscriberCountBySubscriptionId && amount > 0) {
        subscriberCountBySubscriptionIdByChannel.set(
            channel,
            (subscriberCountBySubscriptionId = { [subscriptionId]: 0 }),
        );
    }
    if (subscriberCountBySubscriptionId?.[subscriptionId] !== undefined) {
        return (subscriberCountBySubscriptionId[subscriptionId] =
            amount + subscriberCountBySubscriptionId[subscriptionId]);
    }
}

const cache = new WeakMap();
function getMemoizedDemultiplexedNotificationPublisherFromChannelAndResponseTransformer<TNotification>(
    channel: RpcSubscriptionsChannel<unknown, RpcNotification<TNotification>>,
    subscribeRequest: RpcRequest,
    responseTransformer?: RpcResponseTransformer,
): DataPublisher<{
    [channelName: `notification:${number}`]: TNotification;
}> {
    let publisherByResponseTransformer = cache.get(channel);
    if (!publisherByResponseTransformer) {
        cache.set(channel, (publisherByResponseTransformer = new WeakMap()));
    }
    const responseTransformerKey = responseTransformer ?? channel;
    let publisher = publisherByResponseTransformer.get(responseTransformerKey);
    if (!publisher) {
        publisherByResponseTransformer.set(
            responseTransformerKey,
            (publisher = demultiplexDataPublisher(channel, 'message', rawMessage => {
                const message = rawMessage as RpcNotification<unknown> | RpcResponseData<unknown>;
                if (!('method' in message)) {
                    return;
                }
                const transformedNotification = responseTransformer
                    ? responseTransformer(message.params.result, subscribeRequest)
                    : message.params.result;
                return [`notification:${message.params.subscription}`, transformedNotification];
            })),
        );
    }
    return publisher;
}

export async function executeRpcPubSubSubscriptionPlan<TNotification>({
    channel,
    responseTransformer,
    signal,
    subscribeRequest,
    unsubscribeMethodName,
}: Config<TNotification>): Promise<DataPublisher<RpcSubscriptionNotificationEvents<TNotification>>> {
    let subscriptionId: number | undefined;
    channel.on(
        'error',
        () => {
            // An error on the channel indicates that the subscriptions are dead.
            // There is no longer any sense hanging on to subscription ids.
            // Erasing it here will prevent the unsubscribe code from running.
            subscriptionId = undefined;
            subscriberCountBySubscriptionIdByChannel.delete(channel);
        },
        { signal },
    );
    /**
     * STEP 1
     * Create a promise that rejects if this subscription is aborted and sends
     * the unsubscribe message if the subscription is active at that time.
     */
    const abortPromise = new Promise<never>((_, reject) => {
        function handleAbort(this: AbortSignal) {
            /**
             * Because of https://github.com/solana-labs/solana/pull/18943, two subscriptions for
             * materially the same notification will be coalesced on the server. This means they
             * will be assigned the same subscription id, and will occupy one subscription slot. We
             * must be careful not to send the unsubscribe message until the last subscriber aborts.
             */
            if (decrementSubscriberCountAndReturnNewCount(channel, subscriptionId) === 0) {
                const unsubscribePayload = createRpcMessage({
                    methodName: unsubscribeMethodName,
                    params: [subscriptionId],
                });
                subscriptionId = undefined;
                channel.send(unsubscribePayload).catch(() => {});
            }
            reject(this.reason);
        }
        if (signal.aborted) {
            handleAbort.call(signal);
        } else {
            signal.addEventListener('abort', handleAbort);
        }
    });
    /**
     * STEP 2
     * Send the subscription request.
     */
    const subscribePayload = createRpcMessage(subscribeRequest);
    await channel.send(subscribePayload);
    /**
     * STEP 3
     * Wait for the acknowledgement from the server with the subscription id.
     */
    const subscriptionIdPromise = new Promise<RpcSubscriptionId>((resolve, reject) => {
        const abortController = new AbortController();
        signal.addEventListener('abort', abortController.abort.bind(abortController));
        const options = { signal: abortController.signal } as const;
        channel.on(
            'error',
            err => {
                abortController.abort();
                reject(err);
            },
            options,
        );
        channel.on(
            'message',
            message => {
                if (message && typeof message === 'object' && 'id' in message && message.id === subscribePayload.id) {
                    abortController.abort();
                    if ('error' in message) {
                        reject(getSolanaErrorFromJsonRpcError(message.error));
                    } else {
                        resolve(message.result);
                    }
                }
            },
            options,
        );
    });
    subscriptionId = await safeRace([abortPromise, subscriptionIdPromise]);
    if (subscriptionId == null) {
        throw new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID);
    }
    incrementSubscriberCount(channel, subscriptionId);
    /**
     * STEP 4
     * Filter out notifications unrelated to this subscription.
     */
    const notificationPublisher = getMemoizedDemultiplexedNotificationPublisherFromChannelAndResponseTransformer(
        channel,
        subscribeRequest,
        responseTransformer,
    );
    const notificationKey = `notification:${subscriptionId}` as const;
    return {
        on(type, listener, options) {
            switch (type) {
                case 'notification':
                    return notificationPublisher.on(
                        notificationKey,
                        listener as (data: RpcSubscriptionNotificationEvents<TNotification>['notification']) => void,
                        options,
                    );
                case 'error':
                    return channel.on(
                        'error',
                        listener as (data: RpcSubscriptionNotificationEvents<TNotification>['error']) => void,
                        options,
                    );
                default:
                    throw new SolanaError(SOLANA_ERROR__INVARIANT_VIOLATION__DATA_PUBLISHER_CHANNEL_UNIMPLEMENTED, {
                        channelName: type,
                        supportedChannelNames: ['notification', 'error'],
                    });
            }
        },
    };
}

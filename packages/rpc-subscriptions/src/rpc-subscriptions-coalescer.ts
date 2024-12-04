import { AbortController } from '@solana/event-target-impl';
import fastStableStringify from '@solana/fast-stable-stringify';
import { RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';
import { DataPublisher } from '@solana/subscribable';

type CacheEntry = {
    readonly abortController: AbortController;
    readonly dataPublisherPromise: Promise<DataPublisher>;
    numSubscribers: number;
};

export function getRpcSubscriptionsTransportWithSubscriptionCoalescing<TTransport extends RpcSubscriptionsTransport>(
    transport: TTransport,
): TTransport {
    const cache = new Map<string, CacheEntry>();
    return function rpcSubscriptionsTransportWithSubscriptionCoalescing(config) {
        const { request, signal } = config;
        const subscriptionConfigurationHash = fastStableStringify([request.methodName, request.params]);

        let cachedDataPublisherPromise = cache.get(subscriptionConfigurationHash);
        if (!cachedDataPublisherPromise) {
            const abortController = new AbortController();
            const dataPublisherPromise = transport({
                ...config,
                signal: abortController.signal,
            });
            dataPublisherPromise
                .then(dataPublisher => {
                    dataPublisher.on(
                        'error',
                        () => {
                            cache.delete(subscriptionConfigurationHash);
                            abortController.abort();
                        },
                        { signal: abortController.signal },
                    );
                })
                .catch(() => {});
            cache.set(
                subscriptionConfigurationHash,
                (cachedDataPublisherPromise = {
                    abortController,
                    dataPublisherPromise,
                    numSubscribers: 0,
                }),
            );
        }
        cachedDataPublisherPromise.numSubscribers++;
        signal.addEventListener(
            'abort',
            () => {
                cachedDataPublisherPromise.numSubscribers--;
                if (cachedDataPublisherPromise.numSubscribers === 0) {
                    queueMicrotask(() => {
                        if (cachedDataPublisherPromise.numSubscribers === 0) {
                            cache.delete(subscriptionConfigurationHash);
                            cachedDataPublisherPromise.abortController.abort();
                        }
                    });
                }
            },
            { signal: cachedDataPublisherPromise.abortController.signal },
        );
        return cachedDataPublisherPromise.dataPublisherPromise;
    } as TTransport;
}

import { PendingRpcSubscriptionsRequest, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';

import { getCachedAbortableIterableFactory } from './cached-abortable-iterable';

type CacheKey = string | undefined;
type Config<TRpcSubscriptionsMethods> = Readonly<{
    getDeduplicationKey: GetDeduplicationKeyFn;
    rpcSubscriptions: RpcSubscriptions<TRpcSubscriptionsMethods>;
}>;
type GetDeduplicationKeyFn = (subscriptionMethod: string | symbol, payload: unknown) => CacheKey;

const EXPLICIT_ABORT_TOKEN = Symbol(
    __DEV__
        ? "This symbol is thrown from a subscription's iterator when the subscription is " +
              'explicitly aborted by the user'
        : undefined,
);

function registerIterableCleanup(iterable: AsyncIterable<unknown>, cleanupFn: CallableFunction) {
    (async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _ of iterable);
        } catch {
            /* empty */
        } finally {
            // Run the cleanup function.
            cleanupFn();
        }
    })();
}

export function getRpcSubscriptionsWithSubscriptionCoalescing<TRpcSubscriptionsMethods>({
    getDeduplicationKey,
    rpcSubscriptions,
}: Config<TRpcSubscriptionsMethods>): RpcSubscriptions<TRpcSubscriptionsMethods> {
    const cache = new Map<CacheKey, PendingRpcSubscriptionsRequest<unknown>>();
    return new Proxy(rpcSubscriptions, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get(target, p, receiver) {
            const subscriptionMethod = Reflect.get(target, p, receiver);
            if (typeof subscriptionMethod !== 'function') {
                return subscriptionMethod;
            }
            return function (...rawParams: unknown[]) {
                const deduplicationKey = getDeduplicationKey(p, rawParams);
                if (deduplicationKey === undefined) {
                    return (subscriptionMethod as CallableFunction)(...rawParams);
                }
                if (cache.has(deduplicationKey)) {
                    return cache.get(deduplicationKey)!;
                }
                const iterableFactory = getCachedAbortableIterableFactory<
                    Parameters<PendingRpcSubscriptionsRequest<unknown>['subscribe']>,
                    AsyncIterable<unknown>
                >({
                    getAbortSignalFromInputArgs: ({ abortSignal }) => abortSignal,
                    getCacheKeyFromInputArgs: () => deduplicationKey,
                    async onCacheHit(_iterable, _config) {
                        /**
                         * This transport's goal is to prevent duplicate subscriptions from
                         * being made. If a cached iterable] is found, do not send the subscribe
                         * message again.
                         */
                    },
                    async onCreateIterable(abortSignal, config) {
                        const pendingSubscription = (subscriptionMethod as CallableFunction)(
                            ...rawParams,
                        ) as PendingRpcSubscriptionsRequest<unknown>;
                        const iterable = await pendingSubscription.subscribe({
                            ...config,
                            abortSignal,
                        });
                        registerIterableCleanup(iterable, () => {
                            cache.delete(deduplicationKey);
                        });
                        return iterable;
                    },
                });
                const pendingSubscription: PendingRpcSubscriptionsRequest<unknown> = {
                    async subscribe(...args) {
                        const iterable = await iterableFactory(...args);
                        const { abortSignal } = args[0];
                        let abortPromise;
                        return {
                            ...iterable,
                            async *[Symbol.asyncIterator]() {
                                abortPromise ||= abortSignal.aborted
                                    ? Promise.reject(EXPLICIT_ABORT_TOKEN)
                                    : new Promise<never>((_, reject) => {
                                          abortSignal.addEventListener('abort', () => {
                                              reject(EXPLICIT_ABORT_TOKEN);
                                          });
                                      });
                                try {
                                    const iterator = iterable[Symbol.asyncIterator]();
                                    while (true) {
                                        const iteratorResult = await Promise.race([iterator.next(), abortPromise]);
                                        if (iteratorResult.done) {
                                            return;
                                        } else {
                                            yield iteratorResult.value;
                                        }
                                    }
                                } catch (e) {
                                    if (e === EXPLICIT_ABORT_TOKEN) {
                                        return;
                                    }
                                    cache.delete(deduplicationKey);
                                    throw e;
                                }
                            },
                        };
                    },
                };
                cache.set(deduplicationKey, pendingSubscription);
                return pendingSubscription;
            };
        },
    });
}

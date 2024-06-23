import type { RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';

import { getCachedAbortableIterableFactory } from './cached-abortable-iterable';

type Config<TTransport extends RpcSubscriptionsTransport> = Readonly<{
    /**
     * You might like to open more subscriptions per connection than your RPC provider allows for.
     * Using the initial payload as input, return a shard key from this method to assign
     * subscriptions to separate connections. One socket will be opened per shard key.
     */
    getShard?: (payload: unknown) => string | symbol;
    transport: TTransport;
}>;

let NULL_SHARD_CACHE_KEY: symbol;
function createNullShardCacheKey() {
    // This function is an annoying workaround to prevent `process.env.NODE_ENV` from appearing at
    // the top level of this module and thwarting an optimizing compiler's attempt to tree-shake.
    return Symbol(__DEV__ ? 'Cache key to use when there is no connection sharding strategy' : undefined);
}

export function getWebSocketTransportWithConnectionSharding<TTransport extends RpcSubscriptionsTransport>({
    getShard,
    transport,
}: Config<TTransport>): TTransport {
    return getCachedAbortableIterableFactory({
        getAbortSignalFromInputArgs: ({ signal }) => signal,
        getCacheKeyFromInputArgs: ({ payload }) =>
            getShard ? getShard(payload) : (NULL_SHARD_CACHE_KEY ||= createNullShardCacheKey()),
        onCacheHit: (connection, { payload }) => connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(payload),
        onCreateIterable: (abortSignal, config) =>
            transport({
                ...config,
                signal: abortSignal,
            }),
    }) as TTransport;
}

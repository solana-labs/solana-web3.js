import { IRpcWebSocketTransport } from '@solana/rpc-transport/dist/types/transports/transport-types';

import { getCachedAbortableIterableFactory } from './cached-abortable-iterable';

type Config = Readonly<{
    /**
     * You might like to open more subscriptions per connection than your RPC provider allows for.
     * Using the initial payload as input, return a shard key from this method to assign
     * subscriptions to separate connections. One socket will be opened per shard key.
     */
    getShard?: (payload: unknown) => string | symbol;
    transport: IRpcWebSocketTransport;
}>;

const NULL_SHARD_CACHE_KEY = Symbol(
    __DEV__ ? 'Cache key to use when there is no connection sharding strategy' : undefined
);

export function getWebSocketTransportWithConnectionSharding({ getShard, transport }: Config): IRpcWebSocketTransport {
    return getCachedAbortableIterableFactory({
        getAbortSignalFromInputArgs: ({ signal }) => signal,
        getCacheEntryMissingError(shardKey) {
            // TODO: Coded error.
            return new Error(`Found no cache entry for connection with shard key \`${shardKey?.toString()}\``);
        },
        getCacheKeyFromInputArgs: ({ payload }) => (getShard ? getShard(payload) : NULL_SHARD_CACHE_KEY),
        onCacheHit: (connection, { payload }) => connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(payload),
        onCreateIterable: (abortSignal, config) =>
            transport({
                ...config,
                signal: abortSignal,
            }),
    });
}

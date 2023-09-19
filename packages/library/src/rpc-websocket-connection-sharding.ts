import { IRpcWebSocketTransport } from '@solana/rpc-transport/dist/types/transports/transport-types';

type CacheEntry = Readonly<{
    abortController: AbortController;
    connection: Awaited<ReturnType<IRpcWebSocketTransport>> | ReturnType<IRpcWebSocketTransport>;
    purgeScheduled: boolean;
    referenceCount: number;
}>;
type CacheKey = string | typeof NULL_SHARD_CACHE_KEY;
type Config = Readonly<{
    /**
     * You might like to open more subscriptions per connection than your RPC provider allows for.
     * Using the initial payload as input, return a shard key from this method to assign
     * subscriptions to separate connections. One socket will be opened per shard key.
     */
    getShard?: (payload: unknown) => string;
    transport: IRpcWebSocketTransport;
}>;

const NULL_SHARD_CACHE_KEY = Symbol(
    __DEV__ ? 'Cache key to use when there is no connection sharding strategy' : undefined
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

export function getWebSocketTransportWithConnectionSharding({ getShard, transport }: Config): IRpcWebSocketTransport {
    const cache = new Map<CacheKey, CacheEntry>();
    function updateCache(shardKey: CacheKey, updater: (currentCacheEntry: CacheEntry) => CacheEntry) {
        const currentCacheEntry = cache.get(shardKey);
        if (!currentCacheEntry) {
            // TODO: Coded error.
            throw new Error(`Found no cache entry for connection with shard key \`${shardKey.toString()}\``);
        }
        const nextCacheEntry = updater(currentCacheEntry);
        cache.set(shardKey, nextCacheEntry);
        return nextCacheEntry;
    }
    return async (...args) => {
        const { payload, signal, ...rest } = args[0];
        const shardKey = getShard ? getShard(payload) : NULL_SHARD_CACHE_KEY;
        function cleanup() {
            cache.delete(shardKey);
            signal.removeEventListener('abort', handleAbort);
        }
        function handleAbort() {
            if (cache.get(shardKey)?.purgeScheduled !== true) {
                updateCache(shardKey, currentCacheEntry => ({
                    ...currentCacheEntry,
                    purgeScheduled: true,
                }));
                globalThis.queueMicrotask(() => {
                    const cacheEntryAtEndOfRunloop = cache.get(shardKey);
                    if (!cacheEntryAtEndOfRunloop) {
                        return;
                    }
                    if (cacheEntryAtEndOfRunloop.referenceCount === 0) {
                        cacheEntry.abortController.abort();
                        cleanup();
                    }
                });
            }
            const cacheEntry = updateCache(shardKey, currentCacheEntry => ({
                ...currentCacheEntry,
                referenceCount: currentCacheEntry.referenceCount - 1,
            }));
        }
        signal.addEventListener('abort', handleAbort);
        try {
            const cacheEntry = cache.get(shardKey);
            if (!cacheEntry) {
                const connectionAbortController = new AbortController();
                const newConnectionPromise = transport({
                    payload,
                    signal: connectionAbortController.signal,
                    ...rest,
                });
                const newCacheEntry = {
                    abortController: connectionAbortController,
                    connection: newConnectionPromise,
                    purgeScheduled: false,
                    referenceCount: 1,
                };
                cache.set(shardKey, newCacheEntry);
                const newConnection = await newConnectionPromise;
                registerIterableCleanup(newConnection, cleanup);
                updateCache(shardKey, currentCacheEntry => ({
                    ...currentCacheEntry,
                    connection: newConnection,
                }));
                return newConnection;
            } else {
                updateCache(shardKey, currentCacheEntry => ({
                    ...currentCacheEntry,
                    referenceCount: currentCacheEntry.referenceCount + 1,
                }));
                const connectionOrConnectionPromise = cacheEntry.connection;
                const cachedConnection =
                    'then' in connectionOrConnectionPromise
                        ? await connectionOrConnectionPromise
                        : connectionOrConnectionPromise;
                registerIterableCleanup(cachedConnection, cleanup);
                await cachedConnection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(payload);
                return cachedConnection;
            }
        } catch (e) {
            cleanup();
            throw e;
        }
    };
}

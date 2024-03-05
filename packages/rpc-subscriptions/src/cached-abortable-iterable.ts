import {
    SOLANA_ERROR__INVARIANT_VIOLATION__CACHED_ABORTABLE_ITERABLE_CACHE_ENTRY_MISSING,
    SolanaError,
} from '@solana/errors';

type CacheEntry<TIterable extends AsyncIterable<unknown>> = {
    abortController: AbortController;
    iterable: Promise<TIterable> | TIterable;
    purgeScheduled: boolean;
    referenceCount: number;
};
type CacheKey = string | symbol;
type Config<TInput extends unknown[], TIterable extends AsyncIterable<unknown>> = Readonly<{
    getAbortSignalFromInputArgs: (...args: TInput) => AbortSignal;
    getCacheKeyFromInputArgs: (...args: TInput) =>
        | CacheKey
        // `undefined` implies 'do not cache'
        | undefined;
    onCacheHit: (iterable: TIterable, ...args: TInput) => Promise<void>;
    onCreateIterable: (abortSignal: AbortSignal, ...args: TInput) => Promise<TIterable>;
}>;

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

export function getCachedAbortableIterableFactory<TInput extends unknown[], TIterable extends AsyncIterable<unknown>>({
    getAbortSignalFromInputArgs,
    getCacheKeyFromInputArgs,
    onCacheHit,
    onCreateIterable,
}: Config<TInput, TIterable>): (...args: TInput) => Promise<TIterable> {
    const cache = new Map<CacheKey, CacheEntry<TIterable>>();
    function getCacheEntryOrThrow(cacheKey: CacheKey) {
        const currentCacheEntry = cache.get(cacheKey);
        if (!currentCacheEntry) {
            throw new SolanaError(SOLANA_ERROR__INVARIANT_VIOLATION__CACHED_ABORTABLE_ITERABLE_CACHE_ENTRY_MISSING, {
                cacheKey: cacheKey.toString(),
            });
        }
        return currentCacheEntry;
    }
    return async (...args: TInput) => {
        const cacheKey = getCacheKeyFromInputArgs(...args);
        const signal = getAbortSignalFromInputArgs(...args);
        if (cacheKey === undefined) {
            return await onCreateIterable(signal, ...args);
        }
        const cleanup = () => {
            cache.delete(cacheKey);
            signal.removeEventListener('abort', handleAbort);
        };
        const handleAbort = () => {
            const cacheEntry = getCacheEntryOrThrow(cacheKey);
            if (cacheEntry.purgeScheduled !== true) {
                cacheEntry.purgeScheduled = true;
                globalThis.queueMicrotask(() => {
                    cacheEntry.purgeScheduled = false;
                    if (cacheEntry.referenceCount === 0) {
                        cacheEntry.abortController.abort();
                        cleanup();
                    }
                });
            }
            cacheEntry.referenceCount--;
        };
        signal.addEventListener('abort', handleAbort);
        try {
            const cacheEntry = cache.get(cacheKey);
            if (!cacheEntry) {
                const singletonAbortController = new AbortController();
                const newIterablePromise = onCreateIterable(singletonAbortController.signal, ...args);
                const newCacheEntry: CacheEntry<TIterable> = {
                    abortController: singletonAbortController,
                    iterable: newIterablePromise,
                    purgeScheduled: false,
                    referenceCount: 1,
                };
                cache.set(cacheKey, newCacheEntry);
                const newIterable = await newIterablePromise;
                registerIterableCleanup(newIterable, cleanup);
                newCacheEntry.iterable = newIterable;
                return newIterable;
            } else {
                cacheEntry.referenceCount++;
                const iterableOrIterablePromise = cacheEntry.iterable;
                const cachedIterable =
                    'then' in iterableOrIterablePromise ? await iterableOrIterablePromise : iterableOrIterablePromise;
                await onCacheHit(cachedIterable, ...args);
                return cachedIterable;
            }
        } catch (e) {
            cleanup();
            throw e;
        }
    };
}

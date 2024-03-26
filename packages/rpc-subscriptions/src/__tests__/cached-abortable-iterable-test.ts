import { getCachedAbortableIterableFactory } from '../cached-abortable-iterable';

describe('getCachedAbortableIterableFactory', () => {
    let asyncGenerator: jest.Mock<AsyncGenerator<unknown, void>>;
    let factory: (...args: unknown[]) => Promise<AsyncIterable<unknown>>;
    let getAbortSignalFromInputArgs: jest.Mock;
    let getCacheKeyFromInputArgs: jest.Mock;
    let onCacheHit: jest.Mock;
    let onCreateIterable: jest.Mock;
    beforeEach(() => {
        jest.useFakeTimers();
        asyncGenerator = jest.fn().mockImplementation(async function* () {
            yield await new Promise(() => {
                /* never resolve */
            });
        });
        getAbortSignalFromInputArgs = jest.fn().mockImplementation(() => new AbortController().signal);
        getCacheKeyFromInputArgs = jest.fn().mockReturnValue('cache-key');
        onCacheHit = jest.fn();
        onCreateIterable = jest.fn().mockResolvedValue({
            [Symbol.asyncIterator]: asyncGenerator,
        });
        factory = getCachedAbortableIterableFactory({
            getAbortSignalFromInputArgs,
            getCacheKeyFromInputArgs,
            onCacheHit,
            onCreateIterable,
        });
    });
    it('reuses the same iterable for multiple invocations in the same runloop', async () => {
        expect.assertions(1);
        await Promise.all([factory('A'), factory('B')]);
        expect(onCreateIterable).toHaveBeenCalledTimes(1);
    });
    it('reuses the same iterable for multiple invocations in different runloops', async () => {
        expect.assertions(1);
        await factory('A');
        await factory('B');
        expect(onCreateIterable).toHaveBeenCalledTimes(1);
    });
    it('reuses the same iterable so long as there is at least one non-aborted consumer', async () => {
        expect.assertions(1);
        const abortControllerA = new AbortController();
        getAbortSignalFromInputArgs.mockReturnValueOnce(abortControllerA.signal);
        await factory('A');
        await factory('B');
        abortControllerA.abort();
        await jest.runAllTimersAsync();
        await factory('C');
        expect(onCreateIterable).toHaveBeenCalledTimes(1);
    });
    it('reuses the same iterable even if a single subscription was aborted as many times as there are subscriptions', async () => {
        expect.assertions(1);
        const abortControllerA = new AbortController();
        getAbortSignalFromInputArgs.mockReturnValueOnce(abortControllerA.signal);
        await factory('A');
        await factory('B');
        abortControllerA.abort();
        abortControllerA.abort();
        await jest.runAllTimersAsync();
        await factory('C');
        expect(onCreateIterable).toHaveBeenCalledTimes(1);
    });
    it('reuses the same iterable so long as there is at least one non-aborted consumer at the end of the runloop, even if all of the existing ones are aborted', async () => {
        expect.assertions(1);
        const abortControllerA = new AbortController();
        const abortControllerB = new AbortController();
        getAbortSignalFromInputArgs.mockReturnValueOnce(abortControllerA.signal);
        await factory('A');
        getAbortSignalFromInputArgs.mockReturnValueOnce(abortControllerB.signal);
        await factory('B');
        abortControllerA.abort();
        abortControllerB.abort();
        await factory('C');
        await jest.runAllTimersAsync();
        expect(onCreateIterable).toHaveBeenCalledTimes(1);
    });
    it('creates a new iterable when all of the prior subscriptions have been aborted in the same runloop', async () => {
        expect.assertions(1);
        const abortControllerA = new AbortController();
        const abortControllerB = new AbortController();
        getAbortSignalFromInputArgs.mockReturnValueOnce(abortControllerA.signal);
        await factory('A');
        getAbortSignalFromInputArgs.mockReturnValueOnce(abortControllerB.signal);
        await factory('B');
        abortControllerA.abort();
        abortControllerB.abort();
        await jest.runAllTimersAsync();
        await factory('C');
        expect(onCreateIterable).toHaveBeenCalledTimes(2);
    });
    it('creates a new iterable when all of the prior subscriptions have been aborted in different runloops', async () => {
        expect.assertions(1);
        const abortControllerA = new AbortController();
        const abortControllerB = new AbortController();
        getAbortSignalFromInputArgs.mockReturnValueOnce(abortControllerA.signal);
        await factory('A');
        getAbortSignalFromInputArgs.mockReturnValueOnce(abortControllerB.signal);
        await factory('B');
        abortControllerA.abort();
        await jest.runAllTimersAsync();
        abortControllerB.abort();
        await jest.runAllTimersAsync();
        await factory('C');
        expect(onCreateIterable).toHaveBeenCalledTimes(2);
    });
    it('creates a new iterable for a message given that the prior one failed synchronously', async () => {
        expect.assertions(2);
        // First time fails synchronously.
        onCreateIterable.mockImplementationOnce(() => {
            throw new Error('o no');
        });
        try {
            await factory('A');
        } catch {
            /* empty */
        }
        expect(onCreateIterable).toHaveBeenCalledTimes(1);
        // Second time succeeds.
        await factory('A');
        expect(onCreateIterable).toHaveBeenCalledTimes(2);
    });
    it('creates a new iterable for a message given that the prior one failed asynchronously', async () => {
        expect.assertions(2);
        // First time fails asynchronously.
        onCreateIterable.mockRejectedValueOnce(new Error('o no'));
        try {
            await factory('A');
        } catch {
            /* empty */
        }
        expect(onCreateIterable).toHaveBeenCalledTimes(1);
        // Second time succeeds.
        await factory('A');
        expect(onCreateIterable).toHaveBeenCalledTimes(2);
    });
    it('creates a new iterable for a message given that the prior iterable threw', async () => {
        expect.assertions(2);
        let throwFromIterable;
        asyncGenerator.mockImplementationOnce(async function* () {
            yield await new Promise((_, reject) => {
                throwFromIterable = reject;
            });
        });
        await factory('A');
        expect(onCreateIterable).toHaveBeenCalledTimes(1);
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        throwFromIterable();
        await jest.runAllTimersAsync();
        await factory('A');
        expect(onCreateIterable).toHaveBeenCalledTimes(2);
    });
    it('creates a new iterable for a message given that prior iterable returned', async () => {
        expect.assertions(1);
        let returnFromIterable;
        asyncGenerator.mockImplementationOnce(async function* () {
            try {
                yield await new Promise((_, reject) => {
                    returnFromIterable = reject;
                });
            } catch {
                return;
            }
        });
        await factory('A');
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        returnFromIterable();
        await jest.runAllTimersAsync();
        await factory('A');
        expect(onCreateIterable).toHaveBeenCalledTimes(2);
    });
    it('calls `onCreateIterable` with the input args when no cached iterable is found', async () => {
        expect.assertions(1);
        await factory('A');
        expect(onCreateIterable).toHaveBeenCalledWith(expect.any(AbortSignal), 'A');
    });
    it('calls `onCreateIterable` with an `AbortSignal` different than the one passed in', async () => {
        expect.assertions(1);
        const signal = new AbortController().signal;
        getAbortSignalFromInputArgs.mockReturnValue(signal);
        await factory('A');
        expect(onCreateIterable.mock.lastCall[0]).not.toBe(signal);
    });
    it('does not call `onCacheHit` in the same runloop until the cached iterable is resolved', async () => {
        expect.assertions(2);
        let resolve;
        onCreateIterable.mockImplementation(
            () =>
                new Promise(r => {
                    resolve = r;
                }),
        );
        Promise.all([factory('A'), factory('B')]);
        expect(onCacheHit).not.toHaveBeenCalled();
        await jest.runAllTimersAsync();
        const iterable = asyncGenerator();
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resolve(iterable);
        await jest.runAllTimersAsync();
        expect(onCacheHit).toHaveBeenCalledWith(iterable, 'B');
    });
    it('calls `onCacheHit` in the same runloop when the cached iterable is already resolved', () => {
        const iterable = asyncGenerator();
        onCreateIterable.mockReturnValue(iterable);
        Promise.all([factory('A'), factory('B')]);
        expect(onCacheHit).toHaveBeenCalledWith(iterable, 'B');
    });
    it('does not call `onCacheHit` in different runloops until the cached iterable is resolved', async () => {
        expect.assertions(2);
        let resolve;
        onCreateIterable.mockImplementation(
            () =>
                new Promise(r => {
                    resolve = r;
                }),
        );
        factory('A');
        await jest.runAllTimersAsync();
        factory('B');
        await jest.runAllTimersAsync();
        expect(onCacheHit).not.toHaveBeenCalled();
        const iterable = asyncGenerator();
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resolve(iterable);
        await jest.runAllTimersAsync();
        expect(onCacheHit).toHaveBeenCalledWith(iterable, 'B');
    });
    it('calls `onCacheHit` in different runloops when the cached iterable is already resolved', async () => {
        expect.assertions(1);
        const iterable = asyncGenerator();
        onCreateIterable.mockReturnValue(iterable);
        await factory('A');
        await factory('B');
        expect(onCacheHit).toHaveBeenCalledWith(iterable, 'B');
    });
    describe('given payloads that produce the same cache key', () => {
        beforeEach(() => {
            getCacheKeyFromInputArgs.mockReturnValue('cache-key');
        });
        it('reuses the same iterable for all payloads in the same runloop', async () => {
            expect.assertions(1);
            await Promise.all([factory('A'), factory('B')]);
            expect(onCreateIterable).toHaveBeenCalledTimes(1);
        });
        it('reuses the same iterable for all payloads in different runloops', async () => {
            expect.assertions(1);
            await factory('A');
            await factory('B');
            expect(onCreateIterable).toHaveBeenCalledTimes(1);
        });
    });
    describe('given payloads that produce different cache keys', () => {
        beforeEach(() => {
            let shardKey = 0;
            getCacheKeyFromInputArgs.mockImplementation(() => `${++shardKey}`);
        });
        it('creates an iterable for each payload in the same runloop', async () => {
            expect.assertions(1);
            await Promise.all([factory('A'), factory('B')]);
            expect(onCreateIterable).toHaveBeenCalledTimes(2);
        });
        it('creates an iterable for each payload in different runloops', async () => {
            expect.assertions(1);
            await factory('A');
            await factory('B');
            expect(onCreateIterable).toHaveBeenCalledTimes(2);
        });
    });
    describe('given payloads that produce the cache key `undefined`', () => {
        beforeEach(() => {
            getCacheKeyFromInputArgs.mockReturnValue(undefined);
        });
        it('creates an iterable for each payload in the same runloop', async () => {
            expect.assertions(1);
            await Promise.all([factory('A'), factory('B')]);
            expect(onCreateIterable).toHaveBeenCalledTimes(2);
        });
        it('creates an iterable for each payload in different runloops', async () => {
            expect.assertions(1);
            await factory('A');
            await factory('B');
            expect(onCreateIterable).toHaveBeenCalledTimes(2);
        });
    });
});

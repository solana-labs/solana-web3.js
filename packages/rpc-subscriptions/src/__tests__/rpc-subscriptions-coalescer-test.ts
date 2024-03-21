import type { RpcSubscriptions } from '@solana/rpc-subscriptions-spec';

import { getRpcSubscriptionsWithSubscriptionCoalescing } from '../rpc-subscriptions-coalescer';

interface TestRpcSubscriptionNotifications {
    nonFunctionProperty: string;
    thingNotifications(...args: unknown[]): unknown;
}

describe('getRpcSubscriptionsWithSubscriptionCoalescing', () => {
    let asyncGenerator: jest.Mock<AsyncGenerator<unknown, void>>;
    let createPendingSubscription: jest.Mock;
    let getDeduplicationKey: jest.Mock;
    let subscribe: jest.Mock;
    let rpcSubscriptions: RpcSubscriptions<TestRpcSubscriptionNotifications>;
    beforeEach(() => {
        jest.useFakeTimers();
        asyncGenerator = jest.fn().mockImplementation(async function* () {
            yield await new Promise(() => {
                /* never resolve */
            });
        });
        getDeduplicationKey = jest.fn();
        subscribe = jest.fn().mockResolvedValue({
            [Symbol.asyncIterator]: asyncGenerator,
        });
        createPendingSubscription = jest.fn().mockReturnValue({ subscribe });
        rpcSubscriptions = getRpcSubscriptionsWithSubscriptionCoalescing<TestRpcSubscriptionNotifications>({
            getDeduplicationKey,
            rpcSubscriptions: {
                nonFunctionProperty: 'foo',
                thingNotifications: createPendingSubscription,
            },
        });
    });
    describe('given invocations that produce the same deduplication key', () => {
        beforeEach(() => {
            getDeduplicationKey.mockReturnValue('deduplication-key');
        });
        it("creates a pending subscription once, with the first invocation's config", async () => {
            expect.assertions(2);
            await Promise.all([
                rpcSubscriptions
                    .thingNotifications({ payload: 'hello' })
                    .subscribe({ abortSignal: new AbortController().signal }),
                rpcSubscriptions
                    .thingNotifications({ payload: 'world' })
                    .subscribe({ abortSignal: new AbortController().signal }),
            ]);
            expect(createPendingSubscription).toHaveBeenCalledTimes(1);
            expect(createPendingSubscription).toHaveBeenCalledWith({
                payload: 'hello',
            });
        });
        it('only calls subscribe once, in the same runloop', async () => {
            expect.assertions(1);
            await Promise.all([
                rpcSubscriptions
                    .thingNotifications({ payload: 'hello' })
                    .subscribe({ abortSignal: new AbortController().signal }),
                rpcSubscriptions
                    .thingNotifications({ payload: 'world' })
                    .subscribe({ abortSignal: new AbortController().signal }),
            ]);
            expect(subscribe).toHaveBeenCalledTimes(1);
        });
        it('only calls subscribe once, in different runloops', async () => {
            expect.assertions(1);
            await rpcSubscriptions
                .thingNotifications({ payload: 'hello' })
                .subscribe({ abortSignal: new AbortController().signal });
            await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: new AbortController().signal });
            expect(subscribe).toHaveBeenCalledTimes(1);
        });
        it('delivers different iterables to each subscription, in the same runloop', async () => {
            expect.assertions(1);
            const [iterableA, iterableB] = await Promise.all([
                rpcSubscriptions
                    .thingNotifications({ payload: 'hello' })
                    .subscribe({ abortSignal: new AbortController().signal }),
                rpcSubscriptions
                    .thingNotifications({ payload: 'world' })
                    .subscribe({ abortSignal: new AbortController().signal }),
            ]);
            expect(iterableA).not.toBe(iterableB);
        });
        it('delivers different iterables to each subscription, in different runloops', async () => {
            expect.assertions(1);
            const iterableA = await rpcSubscriptions
                .thingNotifications({ payload: 'hello' })
                .subscribe({ abortSignal: new AbortController().signal });
            const iterableB = await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: new AbortController().signal });
            expect(iterableA).not.toBe(iterableB);
        });
        it('publishes the same messages through both iterables', async () => {
            expect.assertions(2);
            asyncGenerator.mockImplementation(async function* () {
                yield Promise.resolve('hello');
            });
            const iterableA = await rpcSubscriptions
                .thingNotifications({ payload: 'hello' })
                .subscribe({ abortSignal: new AbortController().signal });
            const iterableB = await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: new AbortController().signal });
            const iteratorA = iterableA[Symbol.asyncIterator]();
            const iteratorB = iterableB[Symbol.asyncIterator]();
            const messagePromiseA = iteratorA.next();
            const messagePromiseB = iteratorB.next();
            await jest.runAllTimersAsync();
            await expect(messagePromiseA).resolves.toHaveProperty('value', 'hello');
            await expect(messagePromiseB).resolves.toHaveProperty('value', 'hello');
        });
        it('aborting a subscription causes it to return', async () => {
            expect.assertions(1);
            asyncGenerator.mockImplementation(async function* () {
                yield Promise.resolve('hello');
            });
            const abortController = new AbortController();
            const iterable = await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: abortController.signal });
            const iterator = iterable[Symbol.asyncIterator]();
            const messagePromise = iterator.next();
            abortController.abort();
            await expect(messagePromise).resolves.toHaveProperty('done', true);
        });
        it('aborting one subscription does not abort the other', async () => {
            expect.assertions(1);
            asyncGenerator.mockImplementation(async function* () {
                yield Promise.resolve('hello');
            });
            const abortControllerA = new AbortController();
            await rpcSubscriptions
                .thingNotifications({ payload: 'hello' })
                .subscribe({ abortSignal: abortControllerA.signal });
            const iterableB = await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: new AbortController().signal });
            const iteratorB = iterableB[Symbol.asyncIterator]();
            const messagePromiseB = iteratorB.next();
            abortControllerA.abort();
            await jest.runAllTimersAsync();
            await expect(messagePromiseB).resolves.toHaveProperty('value', 'hello');
        });
    });
    describe('given payloads that produce different deduplication keys', () => {
        beforeEach(() => {
            let deduplicationKey = 0;
            getDeduplicationKey.mockImplementation(() => `${++deduplicationKey}`);
        });
        it('creates a pending subscription for each', async () => {
            expect.assertions(3);
            await Promise.all([
                rpcSubscriptions
                    .thingNotifications({ payload: 'hello' })
                    .subscribe({ abortSignal: new AbortController().signal }),
                rpcSubscriptions
                    .thingNotifications({ payload: 'world' })
                    .subscribe({ abortSignal: new AbortController().signal }),
            ]);
            expect(createPendingSubscription).toHaveBeenCalledTimes(2);
            expect(createPendingSubscription).toHaveBeenNthCalledWith(1, {
                payload: 'hello',
            });
            expect(createPendingSubscription).toHaveBeenNthCalledWith(2, {
                payload: 'world',
            });
        });
        it('calls subscribe once for each subscription, in the same runloop', async () => {
            expect.assertions(1);
            await Promise.all([
                rpcSubscriptions
                    .thingNotifications({ payload: 'hello' })
                    .subscribe({ abortSignal: new AbortController().signal }),
                rpcSubscriptions
                    .thingNotifications({ payload: 'world' })
                    .subscribe({ abortSignal: new AbortController().signal }),
            ]);
            expect(subscribe).toHaveBeenCalledTimes(2);
        });
        it('calls subscribe once for each subscription, in different runloops', async () => {
            expect.assertions(1);
            await rpcSubscriptions
                .thingNotifications({ payload: 'hello' })
                .subscribe({ abortSignal: new AbortController().signal });
            await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: new AbortController().signal });
            expect(subscribe).toHaveBeenCalledTimes(2);
        });
        it('delivers different iterables to each subscription, in the same runloop', async () => {
            expect.assertions(1);
            const [iterableA, iterableB] = await Promise.all([
                rpcSubscriptions
                    .thingNotifications({ payload: 'hello' })
                    .subscribe({ abortSignal: new AbortController().signal }),
                rpcSubscriptions
                    .thingNotifications({ payload: 'world' })
                    .subscribe({ abortSignal: new AbortController().signal }),
            ]);
            expect(iterableA).not.toBe(iterableB);
        });
        it('delivers different iterables to each subscription, in different runloops', async () => {
            expect.assertions(1);
            const iterableA = await rpcSubscriptions
                .thingNotifications({ payload: 'hello' })
                .subscribe({ abortSignal: new AbortController().signal });
            const iterableB = await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: new AbortController().signal });
            expect(iterableA).not.toBe(iterableB);
        });
        it('publishes messages through the correct iterable', async () => {
            expect.assertions(2);
            subscribe.mockResolvedValueOnce({
                async *[Symbol.asyncIterator]() {
                    yield Promise.resolve('hello');
                },
            });
            const iterableA = await rpcSubscriptions
                .thingNotifications({ payload: 'hello' })
                .subscribe({ abortSignal: new AbortController().signal });
            subscribe.mockResolvedValueOnce({
                async *[Symbol.asyncIterator]() {
                    yield Promise.resolve('world');
                },
            });
            const iterableB = await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: new AbortController().signal });
            const iteratorA = iterableA[Symbol.asyncIterator]();
            const iteratorB = iterableB[Symbol.asyncIterator]();
            const messagePromiseA = iteratorA.next();
            const messagePromiseB = iteratorB.next();
            await jest.runAllTimersAsync();
            await expect(messagePromiseA).resolves.toHaveProperty('value', 'hello');
            await expect(messagePromiseB).resolves.toHaveProperty('value', 'world');
        });
        it('aborting a subscription causes it to return', async () => {
            expect.assertions(1);
            asyncGenerator.mockImplementation(async function* () {
                yield Promise.resolve('hello');
            });
            const abortController = new AbortController();
            const iterable = await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: abortController.signal });
            const iterator = iterable[Symbol.asyncIterator]();
            const messagePromise = iterator.next();
            abortController.abort();
            await expect(messagePromise).resolves.toHaveProperty('done', true);
        });
        it('aborting one subscription does not abort the other', async () => {
            expect.assertions(1);
            asyncGenerator.mockImplementation(async function* () {
                yield Promise.resolve('hello');
            });
            const abortControllerA = new AbortController();
            await rpcSubscriptions
                .thingNotifications({ payload: 'hello' })
                .subscribe({ abortSignal: abortControllerA.signal });
            const iterableB = await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: new AbortController().signal });
            const iteratorB = iterableB[Symbol.asyncIterator]();
            const messagePromiseB = iteratorB.next();
            abortControllerA.abort();
            await jest.runAllTimersAsync();
            await expect(messagePromiseB).resolves.toHaveProperty('value', 'hello');
        });
    });
    describe('given payloads that produce no deduplcation key', () => {
        beforeEach(() => {
            getDeduplicationKey.mockReturnValue(undefined);
        });
        it('creates a pending subscription for each', async () => {
            expect.assertions(3);
            await Promise.all([
                rpcSubscriptions
                    .thingNotifications({ payload: 'hello' })
                    .subscribe({ abortSignal: new AbortController().signal }),
                rpcSubscriptions
                    .thingNotifications({ payload: 'world' })
                    .subscribe({ abortSignal: new AbortController().signal }),
            ]);
            expect(createPendingSubscription).toHaveBeenCalledTimes(2);
            expect(createPendingSubscription).toHaveBeenNthCalledWith(1, {
                payload: 'hello',
            });
            expect(createPendingSubscription).toHaveBeenNthCalledWith(2, {
                payload: 'world',
            });
        });
        it('calls subscribe once for each subscription, in the same runloop', async () => {
            expect.assertions(1);
            await Promise.all([
                rpcSubscriptions
                    .thingNotifications({ payload: 'hello' })
                    .subscribe({ abortSignal: new AbortController().signal }),
                rpcSubscriptions
                    .thingNotifications({ payload: 'world' })
                    .subscribe({ abortSignal: new AbortController().signal }),
            ]);
            expect(subscribe).toHaveBeenCalledTimes(2);
        });
        it('calls subscribe once for each subscription, in different runloops', async () => {
            expect.assertions(1);
            await rpcSubscriptions
                .thingNotifications({ payload: 'hello' })
                .subscribe({ abortSignal: new AbortController().signal });
            await rpcSubscriptions
                .thingNotifications({ payload: 'world' })
                .subscribe({ abortSignal: new AbortController().signal });
            expect(subscribe).toHaveBeenCalledTimes(2);
        });
    });
    it('does not shim non-function properties on the RPC', () => {
        expect(rpcSubscriptions.nonFunctionProperty).toBe('foo');
    });
});

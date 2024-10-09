import type { RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';

import { getRpcSubscriptionsTransportWithSubscriptionCoalescing } from '../rpc-subscriptions-coalescer';

describe('getRpcSubscriptionsTransportWithSubscriptionCoalescing', () => {
    let mockInnerTransport: jest.Mock;
    let mockOn: jest.Mock;
    let coalescedTransport: RpcSubscriptionsTransport;
    function receiveError(err?: unknown) {
        mockOn.mock.calls.filter(([type]) => type === 'error').forEach(([_, listener]) => listener(err));
    }
    beforeEach(() => {
        mockOn = jest.fn();
        mockInnerTransport = jest.fn().mockResolvedValue({ on: mockOn });
        coalescedTransport = getRpcSubscriptionsTransportWithSubscriptionCoalescing(mockInnerTransport);
    });
    it('returns the inner transport', async () => {
        expect.assertions(1);
        const expectedDataPublisher = { on: mockOn };
        mockInnerTransport.mockResolvedValue(expectedDataPublisher);
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        const transportPromise = coalescedTransport(config);
        await expect(transportPromise).resolves.toBe(expectedDataPublisher);
    });
    it('passes the `executeSubscriptionPlan` config to the inner transport', () => {
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        coalescedTransport(config);
        expect(mockInnerTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                executeSubscriptionPlan: config.executeSubscriptionPlan,
            }),
        );
    });
    it('passes the `subscriptionConfigurationHash` config to the inner transport', () => {
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        coalescedTransport(config);
        expect(mockInnerTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                subscriptionConfigurationHash: 'MOCK_HASH',
            }),
        );
    });
    it('calls the inner transport once per subscriber whose hashes do not match, in the same runloop', () => {
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
        };
        coalescedTransport({ ...config, subscriptionConfigurationHash: 'MOCK_HASH_A' });
        coalescedTransport({ ...config, subscriptionConfigurationHash: 'MOCK_HASH_B' });
        expect(mockInnerTransport).toHaveBeenCalledTimes(2);
    });
    it('calls the inner transport once per subscriber whose hashes do not match, in different runloops', async () => {
        expect.assertions(1);
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
        };
        await coalescedTransport({ ...config, subscriptionConfigurationHash: 'MOCK_HASH_A' });
        await coalescedTransport({ ...config, subscriptionConfigurationHash: 'MOCK_HASH_B' });
        expect(mockInnerTransport).toHaveBeenCalledTimes(2);
    });
    it("calls the inner transport once per subscriber when both subscribers' hashes are `undefined`, in the same runloop", () => {
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
        };
        coalescedTransport({ ...config, subscriptionConfigurationHash: undefined });
        coalescedTransport({ ...config, subscriptionConfigurationHash: undefined });
        expect(mockInnerTransport).toHaveBeenCalledTimes(2);
    });
    it("calls the inner transport once per subscriber when both subscribers' hashes are `undefined`, in different runloops", async () => {
        expect.assertions(1);
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
        };
        await coalescedTransport({ ...config, subscriptionConfigurationHash: undefined });
        await coalescedTransport({ ...config, subscriptionConfigurationHash: undefined });
        expect(mockInnerTransport).toHaveBeenCalledTimes(2);
    });
    it('only calls the inner transport once, in the same runloop', () => {
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        coalescedTransport(config);
        coalescedTransport(config);
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
    });
    it('only calls the inner transport once, in different runloops', async () => {
        expect.assertions(1);
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        await coalescedTransport(config);
        await coalescedTransport(config);
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
    });
    it('delivers the same value to each subscriber, in the same runloop', async () => {
        expect.assertions(1);
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        const [publisherA, publisherB] = await Promise.all([coalescedTransport(config), coalescedTransport(config)]);
        expect(publisherA).toBe(publisherB);
    });
    it('delivers the same value to each subscriber, in different runloops', async () => {
        expect.assertions(1);
        const config = {
            executeSubscriptionPlan: jest.fn(),
            signal: new AbortController().signal,
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        const publisherA = await coalescedTransport(config);
        const publisherB = await coalescedTransport(config);
        expect(publisherA).toBe(publisherB);
    });
    it('does not fire the inner abort signal if fewer than all subscribers abort, in the same runloop', () => {
        jest.useFakeTimers();
        const config = {
            executeSubscriptionPlan: jest.fn(),
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        const abortControllerB = new AbortController();
        coalescedTransport({ ...config, signal: new AbortController().signal });
        coalescedTransport({ ...config, signal: abortControllerB.signal });
        abortControllerB.abort();
        jest.runAllTicks();
        expect(mockInnerTransport.mock.lastCall?.[0].signal).toHaveProperty('aborted', false);
    });
    it('fires the inner abort signal if all subscribers abort, in the same runloop', () => {
        jest.useFakeTimers();
        const config = {
            executeSubscriptionPlan: jest.fn(),
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        const abortControllerA = new AbortController();
        const abortControllerB = new AbortController();
        coalescedTransport({ ...config, signal: abortControllerA.signal });
        coalescedTransport({ ...config, signal: abortControllerB.signal });
        abortControllerA.abort();
        abortControllerB.abort();
        jest.runAllTicks();
        expect(mockInnerTransport.mock.lastCall?.[0].signal).toHaveProperty('aborted', true);
    });
    it('fires the inner abort signal if all subscribers abort, in different runloops', async () => {
        expect.assertions(1);
        const config = {
            executeSubscriptionPlan: jest.fn(),
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        const abortControllerA = new AbortController();
        const abortControllerB = new AbortController();
        coalescedTransport({ ...config, signal: abortControllerA.signal });
        await jest.runAllTimersAsync();
        coalescedTransport({ ...config, signal: abortControllerB.signal });
        await jest.runAllTimersAsync();
        abortControllerA.abort();
        abortControllerB.abort();
        jest.runAllTicks();
        expect(mockInnerTransport.mock.lastCall?.[0].signal).toHaveProperty('aborted', true);
    });
    it('does not fire the inner abort signal if the subscriber count is non zero at the end of the runloop, despite having aborted all in the middle of it', () => {
        const config = {
            executeSubscriptionPlan: jest.fn(),
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        const abortControllerA = new AbortController();
        coalescedTransport({ ...config, signal: abortControllerA.signal });
        abortControllerA.abort();
        coalescedTransport({ ...config, signal: new AbortController().signal });
        jest.runAllTicks();
        expect(mockInnerTransport.mock.lastCall?.[0].signal).toHaveProperty('aborted', false);
    });
    it('does not re-coalesce new requests behind an errored transport', async () => {
        expect.assertions(1);
        jest.useFakeTimers();
        const config = {
            executeSubscriptionPlan: jest.fn(),
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        coalescedTransport({ ...config, signal: new AbortController().signal });
        await jest.runAllTimersAsync();
        receiveError('o no');
        coalescedTransport({ ...config, signal: new AbortController().signal });
        expect(mockInnerTransport).toHaveBeenCalledTimes(2);
    });
    it('does not cancel a newly-coalesced transport when an old errored one is aborted', async () => {
        expect.assertions(2);
        jest.useFakeTimers();
        const config = {
            executeSubscriptionPlan: jest.fn(),
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        const abortControllerA = new AbortController();
        /**
         * PHASE 1
         * Create and fail a transport.
         */
        await coalescedTransport({ ...config, signal: abortControllerA.signal });
        receiveError('o no');
        mockInnerTransport.mockClear();
        /**
         * PHASE 2
         * Create a new transport
         */
        const publisherA = await coalescedTransport({ ...config, signal: new AbortController().signal });
        /**
         * PHASE 3
         * Abort the original subscriber
         */
        abortControllerA.abort();
        jest.runAllTicks();
        /**
         * PHASE 4
         * Create a new transport and expect it to coalesce behind the one in phase 2
         */
        const publisherB = await coalescedTransport({ ...config, signal: new AbortController().signal });
        expect(publisherA).toBe(publisherB);
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
    });
});

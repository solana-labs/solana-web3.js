import {
    SOLANA_ERROR__INVARIANT_VIOLATION__DATA_PUBLISHER_CHANNEL_UNIMPLEMENTED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID,
    SolanaError,
} from '@solana/errors';
import { DataPublisher } from '@solana/subscribable';

import { RpcSubscriptionChannelEvents, RpcSubscriptionsChannel } from '../rpc-subscriptions-channel';
import { executeRpcPubSubSubscriptionPlan } from '../rpc-subscriptions-pubsub-plan';

let mockId = 0;
let lastMessageId: number;
jest.mock('@solana/rpc-spec-types', () => ({
    ...jest.requireActual('@solana/rpc-spec-types'),
    createRpcMessage(...args: never[]) {
        lastMessageId = mockId++;
        return {
            ...jest.requireActual('@solana/rpc-spec-types').createRpcMessage(...args),
            id: lastMessageId,
        };
    },
}));

describe('executeRpcPubSubSubscriptionPlan', () => {
    let abortController: AbortController;
    let mockChannel: { on: jest.Mock; send: unknown };
    let mockSend: jest.Mock;
    function receiveError(err?: unknown) {
        mockChannel.on.mock.calls.filter(([type]) => type === 'error').forEach(([_, listener]) => listener(err));
    }
    function receiveMessage(message: unknown) {
        mockChannel.on.mock.calls.filter(([type]) => type === 'message').forEach(([_, listener]) => listener(message));
    }
    beforeEach(() => {
        abortController = new AbortController();
        mockSend = jest.fn().mockResolvedValue(void 0);
        mockChannel = {
            on: jest.fn().mockReturnValue(() => {}),
            send: mockSend,
        };
    });
    it('rejects when already aborted', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        abortController.abort();
        const publisherPromise = executeRpcPubSubSubscriptionPlan({
            channel: mockChannel as RpcSubscriptionsChannel<unknown, unknown>,
            signal: abortController.signal,
            subscribeMethodName: 'thingSubscribe',
            subscribeParams: [],
            unsubscribeMethodName: 'thingUnsubscribe',
        });
        await expect(publisherPromise).rejects.toThrow();
    });
    it('subscribes to the channel for errors', () => {
        executeRpcPubSubSubscriptionPlan({
            channel: mockChannel as RpcSubscriptionsChannel<unknown, unknown>,
            signal: abortController.signal,
            subscribeMethodName: 'thingSubscribe',
            subscribeParams: [],
            unsubscribeMethodName: 'thingUnsubscribe',
        });
        expect(mockChannel.on).toHaveBeenCalledWith('error', expect.any(Function), {
            signal: abortController.signal,
        });
    });
    it('sends the expected subscribe message', () => {
        const expectedParams = [1, 2, 3];
        executeRpcPubSubSubscriptionPlan({
            channel: mockChannel as RpcSubscriptionsChannel<unknown, unknown>,
            signal: abortController.signal,
            subscribeMethodName: 'thingSubscribe',
            subscribeParams: expectedParams,
            unsubscribeMethodName: 'thingUnsubscribe',
        });
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                id: expect.any(Number),
                jsonrpc: '2.0',
                method: 'thingSubscribe',
                params: expectedParams,
            }),
        );
    });
    describe('given that the subscribe message fails to send', () => {
        beforeEach(() => {
            mockSend.mockRejectedValue('o no');
        });
        it("rejects with the send method's rejection", async () => {
            expect.assertions(1);
            const publisherPromise = executeRpcPubSubSubscriptionPlan({
                channel: mockChannel as RpcSubscriptionsChannel<unknown, unknown>,
                signal: abortController.signal,
                subscribeMethodName: 'thingSubscribe',
                subscribeParams: [],
                unsubscribeMethodName: 'thingUnsubscribe',
            });
            await expect(publisherPromise).rejects.toBe('o no');
        });
        it('does not send an unsubscribe message when aborted', () => {
            expect.assertions(1);
            mockSend.mockClear();
            abortController.abort();
            expect(mockSend).not.toHaveBeenCalled();
        });
    });
    describe('given that the server has not yet acknowledged the subscription', () => {
        let publisherPromise: ReturnType<typeof executeRpcPubSubSubscriptionPlan>;
        beforeEach(() => {
            publisherPromise = executeRpcPubSubSubscriptionPlan({
                channel: mockChannel as RpcSubscriptionsChannel<unknown, unknown>,
                signal: abortController.signal,
                subscribeMethodName: 'thingSubscribe',
                subscribeParams: [],
                unsubscribeMethodName: 'thingUnsubscribe',
            });
        });
        afterEach(() => {
            publisherPromise.catch(() => {});
        });
        it('rejects when aborted', async () => {
            expect.assertions(1);
            abortController.abort();
            await expect(publisherPromise).rejects.toThrow();
        });
        it('does not send an unsubscribe message when aborted', () => {
            expect.assertions(1);
            mockSend.mockClear();
            abortController.abort();
            expect(mockSend).not.toHaveBeenCalled();
        });
    });
    it("throws when the server's subscription acknowledgement does not contain a subscription id number", async () => {
        expect.assertions(1);
        const publisherPromise = executeRpcPubSubSubscriptionPlan({
            channel: mockChannel as RpcSubscriptionsChannel<unknown, unknown>,
            signal: abortController.signal,
            subscribeMethodName: 'thingSubscribe',
            subscribeParams: [],
            unsubscribeMethodName: 'thingUnsubscribe',
        });
        await Promise.resolve();
        receiveMessage({ id: lastMessageId, jsonrpc: '2.0', result: undefined });
        await expect(publisherPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID),
        );
    });
    describe('given that the server has already acknowledged the subscription', () => {
        let expectedSubscriptionId: number;
        let publisherPromise: Promise<
            DataPublisher<Omit<RpcSubscriptionChannelEvents<unknown>, 'message'> & { notification: unknown }>
        >;
        let mockResponseTransformer: jest.Mock;
        beforeEach(async () => {
            jest.useFakeTimers();
            mockResponseTransformer = jest.fn().mockImplementation(result => result);
            publisherPromise = executeRpcPubSubSubscriptionPlan({
                channel: mockChannel as RpcSubscriptionsChannel<unknown, unknown>,
                responseTransformer: mockResponseTransformer,
                signal: abortController.signal,
                subscribeMethodName: 'thingSubscribe',
                subscribeParams: [],
                unsubscribeMethodName: 'thingUnsubscribe',
            });
            await jest.runAllTimersAsync();
            receiveMessage({ id: lastMessageId, jsonrpc: '2.0', result: (expectedSubscriptionId = 123) });
        });
        it('publishes errors', async () => {
            expect.assertions(1);
            const publisher = await publisherPromise;
            const errorListener = jest.fn();
            publisher.on('error', errorListener);
            receiveError('o no');
            expect(errorListener).toHaveBeenCalledWith('o no');
        });
        it('publishes notifications that match this subscription id', async () => {
            expect.assertions(1);
            const publisher = await publisherPromise;
            const notificationListener = jest.fn();
            publisher.on('notification', notificationListener);
            receiveMessage({
                jsonrpc: '2.0',
                method: 'thingNotification',
                params: {
                    result: 'hi',
                    subscription: expectedSubscriptionId,
                },
            });
            expect(notificationListener).toHaveBeenCalledWith('hi');
        });
        it('throws when a caller tries to listen to an unsupported channel', async () => {
            expect.assertions(1);
            const publisher = await publisherPromise;
            const badListener = jest.fn();
            expect(() => {
                publisher.on(
                    // @ts-expect-error This test supplies a bad event name on purpose.
                    'bad',
                    badListener,
                );
            }).toThrow(
                new SolanaError(SOLANA_ERROR__INVARIANT_VIOLATION__DATA_PUBLISHER_CHANNEL_UNIMPLEMENTED, {
                    channelName: 'bad',
                    supportedChannelNames: ['notification', 'error'],
                }),
            );
        });
        it('publishes notifications transformed by the response transformer that match this subscription id', async () => {
            expect.assertions(1);
            mockResponseTransformer.mockImplementation(result => `now hear this: ${result}`);
            const publisher = await publisherPromise;
            const notificationListener = jest.fn();
            publisher.on('notification', notificationListener);
            receiveMessage({
                jsonrpc: '2.0',
                method: 'thingNotification',
                params: {
                    result: 'hi',
                    subscription: expectedSubscriptionId,
                },
            });
            expect(notificationListener).toHaveBeenCalledWith('now hear this: hi');
        });
        it('calls the response transformer only once per notification, even when there are multiple subscribers', async () => {
            expect.assertions(1);
            const publisher = await publisherPromise;
            const notificationListenerA = jest.fn();
            const notificationListenerB = jest.fn();
            publisher.on('notification', notificationListenerA);
            publisher.on('notification', notificationListenerB);
            receiveMessage({
                jsonrpc: '2.0',
                method: 'thingNotification',
                params: {
                    result: 'hi',
                    subscription: expectedSubscriptionId,
                },
            });
            expect(mockResponseTransformer).toHaveBeenCalledTimes(1);
        });
        it("does not publish notifications that don't match this subscription id", async () => {
            expect.assertions(1);
            const publisher = await publisherPromise;
            const notificationListener = jest.fn();
            publisher.on('notification', notificationListener);
            receiveMessage({
                jsonrpc: '2.0',
                method: 'thingNotification',
                params: {
                    result: 'hi',
                    subscription: expectedSubscriptionId + 1,
                },
            });
            expect(notificationListener).not.toHaveBeenCalled();
        });
        it('sends an unsubscribe message when aborted', () => {
            expect.assertions(1);
            mockSend.mockClear();
            abortController.abort();
            expect(mockSend).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expect.any(Number),
                    jsonrpc: '2.0',
                    method: 'thingUnsubscribe',
                    params: [expectedSubscriptionId],
                }),
            );
        });
        describe('but then later errors', () => {
            beforeEach(() => {
                receiveError('o no');
            });
            it('does not send an unsubscribe message when aborted', () => {
                expect.assertions(1);
                mockSend.mockClear();
                abortController.abort();
                expect(mockSend).not.toHaveBeenCalled();
            });
        });
        describe('and then acknowledges a subsequent subscription with the same subscription id', () => {
            let secondAbortController: AbortController;
            beforeEach(async () => {
                jest.useFakeTimers();
                secondAbortController = new AbortController();
                executeRpcPubSubSubscriptionPlan({
                    channel: mockChannel as RpcSubscriptionsChannel<unknown, unknown>,
                    signal: secondAbortController.signal,
                    subscribeMethodName: 'thingSubscribe',
                    subscribeParams: [],
                    unsubscribeMethodName: 'thingUnsubscribe',
                });
                await jest.runAllTimersAsync();
                receiveMessage({ id: lastMessageId, jsonrpc: '2.0', result: (expectedSubscriptionId = 123) });
            });
            /**
             * Because of https://github.com/solana-labs/solana/pull/18943, two subscriptions for
             * materially the same notification will be coalesced on the server. This means they
             * will be assigned the same subscription id, and will occupy one subscription slot. We
             * must be careful not to send the unsubscribe message until the last subscriber aborts.
             */
            it('does not send the unsubscribe message when fewer than all of the subscriptions are aborted', () => {
                mockSend.mockClear();
                abortController.abort();
                expect(mockSend).not.toHaveBeenCalled();
            });
            it('sends the unsubscribe message once all of the subscriptions abort', () => {
                mockSend.mockClear();
                abortController.abort();
                secondAbortController.abort();
                expect(mockSend).toHaveBeenCalledWith(
                    expect.objectContaining({ method: 'thingUnsubscribe', params: [expectedSubscriptionId] }),
                );
            });
        });
    });
});

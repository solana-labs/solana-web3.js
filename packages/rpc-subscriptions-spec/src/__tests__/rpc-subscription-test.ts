import {
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CANNOT_CREATE_SUBSCRIPTION_REQUEST,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID,
    SolanaError,
    SolanaErrorCode,
} from '@solana/errors';
import { createRpcMessage } from '@solana/rpc-spec-types';

import { createSubscriptionRpc, RpcSubscriptions } from '../rpc-subscriptions';
import { RpcSubscriptionsApi } from '../rpc-subscriptions-api';
import { RpcSubscriptionsRequest } from '../rpc-subscriptions-request';
import { RpcSubscriptionsTransport } from '../rpc-subscriptions-transport';

// Partially mock the rpc-spec-types package.
jest.mock('@solana/rpc-spec-types', () => ({
    ...jest.requireActual('@solana/rpc-spec-types'),
    createRpcMessage: jest.fn(),
}));

interface TestRpcSubscriptionNotifications {
    nonConformingNotif(...args: unknown[]): unknown;
    thingNotifications(...args: unknown[]): unknown;
}

describe('JSON-RPC 2.0 Subscriptions', () => {
    let createWebSocketConnection: jest.MockedFn<RpcSubscriptionsTransport>;
    let iterable: jest.Mock<AsyncGenerator<unknown, void>>;
    let rpc: RpcSubscriptions<TestRpcSubscriptionNotifications>;
    let send: jest.Mock<(payload: unknown) => Promise<void>>;
    beforeEach(() => {
        jest.mocked(createRpcMessage).mockImplementation(<TParams>(method: string, params: TParams) => ({
            id: 0,
            jsonrpc: '2.0',
            method,
            params,
        }));
        iterable = jest.fn().mockImplementation(async function* () {
            yield await new Promise(() => {
                /* never resolve */
            });
        });
        send = jest.fn().mockResolvedValue(undefined);
        createWebSocketConnection = jest.fn().mockResolvedValue({
            [Symbol.asyncIterator]: iterable,
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: send,
        });
        rpc = createSubscriptionRpc({
            api: {
                // Note the lack of method implementations in the base case.
            } as RpcSubscriptionsApi<TestRpcSubscriptionNotifications>,
            transport: createWebSocketConnection,
        });
    });
    it('sends a subscription request to the transport', () => {
        rpc.thingNotifications(123).subscribe({ abortSignal: new AbortController().signal });
        expect(createWebSocketConnection).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: {
                    ...createRpcMessage('thingSubscribe', [123]),
                    id: expect.any(Number),
                },
            }),
        );
    });
    it('returns from the iterator when the connection iterator returns', async () => {
        expect.assertions(1);
        iterable.mockImplementation(async function* () {
            yield Promise.resolve({ id: 0, result: 42 /* subscription id */ });
            return;
        });
        const thingNotifications = await rpc
            .thingNotifications(123)
            .subscribe({ abortSignal: new AbortController().signal });
        const iterator = thingNotifications[Symbol.asyncIterator]();
        const thingNotificationPromise = iterator.next();
        await expect(thingNotificationPromise).resolves.toMatchObject({
            done: true,
            value: undefined,
        });
    });
    it('throws from the iterator when the connection iterator throws', async () => {
        expect.assertions(1);
        iterable.mockImplementation(async function* () {
            yield Promise.resolve({ id: 0, result: 42 /* subscription id */ });
            throw new Error('o no');
        });
        const thingNotifications = await rpc
            .thingNotifications(123)
            .subscribe({ abortSignal: new AbortController().signal });
        const iterator = thingNotifications[Symbol.asyncIterator]();
        const thingNotificationPromise = iterator.next();
        await expect(thingNotificationPromise).rejects.toThrow('o no');
    });
    it('aborts the connection when aborting the subscription before the subscription has been established', async () => {
        expect.assertions(2);
        jest.useFakeTimers();
        iterable.mockImplementation(async function* () {
            yield await new Promise(() => {
                /* never resolve */
            });
        });
        const abortController = new AbortController();
        rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
        const [{ signal: connectionAbortSignal }] = createWebSocketConnection.mock.lastCall!;
        expect(connectionAbortSignal).toHaveProperty('aborted', false);
        abortController.abort();
        await jest.runAllTimersAsync();
        expect(connectionAbortSignal).toHaveProperty('aborted', true);
    });
    it('aborts the connection when aborting given an established subscription', async () => {
        expect.assertions(2);
        jest.useFakeTimers();
        iterable.mockImplementation(async function* () {
            yield { id: 0, result: 42 /* subscription id */ };
            yield await new Promise(() => {
                /* never resolve */
            });
        });
        const abortController = new AbortController();
        await rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
        const [{ signal: connectionAbortSignal }] = createWebSocketConnection.mock.lastCall!;
        expect(connectionAbortSignal).toHaveProperty('aborted', false);
        abortController.abort();
        await jest.runAllTimersAsync();
        expect(connectionAbortSignal).toHaveProperty('aborted', true);
    });
    it('sends an unsubscribe request to the transport when aborted given an established subscription', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        iterable.mockImplementation(async function* () {
            yield { id: 0, result: 42 /* subscription id */ };
            yield await new Promise(() => {
                /* never resolve */
            });
        });
        await rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
        abortController.abort();
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'thingUnsubscribe',
                params: [42],
            }),
        );
    });
    it('does not send an unsubscribe request to the transport when aborted if the subscription has not yet been established', () => {
        jest.useFakeTimers();
        const abortController = new AbortController();
        rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
        abortController.abort();
        expect(send).not.toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'thingUnsubscribe',
            }),
        );
    });
    it('does not send an unsubscribe request to the transport when aborted after the connection iterator returns given an established subscription', async () => {
        expect.assertions(1);
        jest.useFakeTimers();
        const abortController = new AbortController();
        let returnFromConnection: () => void;
        iterable.mockImplementation(async function* () {
            yield { id: 0, result: 42 /* subscription id */ };
            try {
                yield await new Promise((_, reject) => {
                    returnFromConnection = reject;
                });
            } catch {
                return;
            }
        });
        await rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        returnFromConnection();
        await jest.runAllTimersAsync();
        abortController.abort();
        expect(send).not.toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'thingUnsubscribe',
            }),
        );
    });
    it('does not send an unsubscribe request to the transport when aborted after the connection iterator fatals given an established subscription', async () => {
        expect.assertions(1);
        jest.useFakeTimers();
        const abortController = new AbortController();
        let killConnection: () => void;
        iterable.mockImplementation(async function* () {
            yield { id: 0, result: 42 /* subscription id */ };
            yield await new Promise((_, reject) => {
                killConnection = reject;
            });
        });
        await rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        killConnection(new Error('o no'));
        await jest.runAllTimersAsync();
        abortController.abort();
        expect(send).not.toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'thingUnsubscribe',
            }),
        );
    });
    it('delivers only messages destined for a particular subscription', async () => {
        expect.assertions(1);
        iterable.mockImplementation(async function* () {
            yield Promise.resolve({ id: 0, result: 42 /* subscription id */ });
            yield Promise.resolve({ params: { result: 123, subscription: 41 } });
            yield Promise.resolve({ params: { result: 456, subscription: 42 } });
        });
        const thingNotifications = await rpc
            .thingNotifications()
            .subscribe({ abortSignal: new AbortController().signal });
        const iterator = thingNotifications[Symbol.asyncIterator]();
        await expect(iterator.next()).resolves.toHaveProperty('value', 456);
    });
    it.each([null, undefined])(
        'fatals when the subscription id returned from the server is `%s`',
        async subscriptionId => {
            expect.assertions(1);
            iterable.mockImplementation(async function* () {
                yield Promise.resolve({ id: 0, result: subscriptionId /* subscription id */ });
            });
            const thingNotificationsPromise = rpc
                .thingNotifications()
                .subscribe({ abortSignal: new AbortController().signal });
            await expect(thingNotificationsPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID),
            );
        },
    );
    it("fatals when called with a method that does not end in 'Notifications'", () => {
        expect(() => {
            rpc.nonConformingNotif().subscribe({ abortSignal: new AbortController().signal });
        }).toThrow(
            new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CANNOT_CREATE_SUBSCRIPTION_REQUEST, {
                notificationName: 'nonConformingNotif',
            }),
        );
    });
    it('fatals when called with an already aborted signal', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        abortController.abort();
        const subscribePromise = rpc.thingNotifications().subscribe({ abortSignal: abortController.signal });
        await expect(subscribePromise).rejects.toThrow(/operation was aborted/);
    });
    it('fatals when the server fails to respond with a subscription id', async () => {
        expect.assertions(1);
        iterable.mockImplementation(async function* () {
            yield Promise.resolve({ id: 0, result: undefined /* subscription id */ });
        });
        const subscribePromise = rpc.thingNotifications().subscribe({ abortSignal: new AbortController().signal });
        await expect(subscribePromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID),
        );
    });
    it('fatals when the server responds with an error', async () => {
        expect.assertions(1);
        iterable.mockImplementation(async function* () {
            yield Promise.resolve({
                error: { code: 123, message: 'o no' },
                id: 0,
            });
        });
        const subscribePromise = rpc.thingNotifications().subscribe({ abortSignal: new AbortController().signal });
        await expect(subscribePromise).rejects.toThrow(new SolanaError(123 as SolanaErrorCode, undefined));
    });
    it('throws errors when the connection fails to construct', async () => {
        expect.assertions(1);
        createWebSocketConnection.mockRejectedValue(new Error('o no'));
        const subscribePromise = rpc.thingNotifications().subscribe({ abortSignal: new AbortController().signal });
        await expect(subscribePromise).rejects.toThrow(/o no/);
    });
    describe('when calling a method having a concrete implementation', () => {
        let rpc: RpcSubscriptions<TestRpcSubscriptionNotifications>;
        beforeEach(() => {
            rpc = createSubscriptionRpc({
                api: {
                    nonConformingNotif(...params: unknown[]): RpcSubscriptionsRequest<unknown> {
                        return {
                            params: [...params, 'augmented', 'params'],
                            subscribeMethodName: 'nonConformingSubscribeAugmented',
                            unsubscribeMethodName: 'nonConformingUnsubscribeAugmented',
                        };
                    },
                } as RpcSubscriptionsApi<TestRpcSubscriptionNotifications>,
                transport: createWebSocketConnection,
            });
        });
        it('converts the returned subscription to a JSON-RPC 2.0 message and sends it to the transport', () => {
            rpc.nonConformingNotif(123).subscribe({ abortSignal: new AbortController().signal });
            expect(createWebSocketConnection).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: {
                        ...createRpcMessage('nonConformingSubscribeAugmented', [123, 'augmented', 'params']),
                        id: expect.any(Number),
                    },
                }),
            );
        });
        it('uses the returned unsubscribe method name when unsubscribing', async () => {
            expect.assertions(1);
            jest.useFakeTimers();
            const abortController = new AbortController();
            iterable.mockImplementation(async function* () {
                yield { id: 0, result: 42 /* subscription id */ };
                yield new Promise(() => {
                    /* never resolve */
                });
            });
            await rpc.nonConformingNotif(123).subscribe({ abortSignal: abortController.signal });
            await jest.runAllTimersAsync();
            abortController.abort();
            expect(send).toHaveBeenCalledWith(createRpcMessage('nonConformingUnsubscribeAugmented', [42]));
        });
    });
    describe('when calling a method whose concrete implementation returns a response processor', () => {
        let responseTransformer: jest.Mock;
        let rpc: RpcSubscriptions<TestRpcSubscriptionNotifications>;
        beforeEach(() => {
            responseTransformer = jest.fn(response => `${response} processed response`);
            rpc = createSubscriptionRpc({
                api: {
                    thingNotifications(...params: unknown[]): RpcSubscriptionsRequest<unknown> {
                        return {
                            params,
                            responseTransformer,
                            subscribeMethodName: 'thingSubscribe',
                            unsubscribeMethodName: 'thingUnsubscribe',
                        };
                    },
                } as RpcSubscriptionsApi<TestRpcSubscriptionNotifications>,
                transport: createWebSocketConnection,
            });
        });
        it('calls the response processor with the response from the JSON-RPC 2.0 endpoint', async () => {
            expect.assertions(1);
            iterable.mockImplementation(async function* () {
                yield Promise.resolve({ id: 0, result: 42 /* subscription id */ });
                yield Promise.resolve({ params: { result: 123, subscription: 42 } });
            });
            const thingNotifications = await rpc
                .thingNotifications()
                .subscribe({ abortSignal: new AbortController().signal });
            await thingNotifications[Symbol.asyncIterator]().next();
            expect(responseTransformer).toHaveBeenCalledWith(123, 'thingSubscribe');
        });
        it('returns the processed response', async () => {
            expect.assertions(1);
            iterable.mockImplementation(async function* () {
                yield Promise.resolve({ id: 0, result: 42 /* subscription id */ });
                yield Promise.resolve({ params: { result: 123, subscription: 42 } });
            });
            const thingNotifications = await rpc
                .thingNotifications()
                .subscribe({ abortSignal: new AbortController().signal });
            await expect(thingNotifications[Symbol.asyncIterator]().next()).resolves.toHaveProperty(
                'value',
                '123 processed response',
            );
        });
    });
});

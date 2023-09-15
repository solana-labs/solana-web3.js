import { SolanaJsonRpcError } from '../json-rpc-errors';
import { createJsonRpcMessage } from '../json-rpc-message';
import { getNextMessageId } from '../json-rpc-message-id';
import { createJsonSubscriptionRpc } from '../json-rpc-subscription';
import { IRpcSubscriptionsApi, RpcSubscription, RpcSubscriptions } from '../json-rpc-types';
import { IRpcWebSocketTransport } from '../transports/transport-types';

jest.mock('../json-rpc-message-id');

interface TestRpcSubscriptionNotifications {
    nonConformingNotif(...args: unknown[]): unknown;
    thingNotifications(...args: unknown[]): unknown;
}

describe('JSON-RPC 2.0 Subscriptions', () => {
    let createWebSocketConnection: IRpcWebSocketTransport;
    let rpc: RpcSubscriptions<TestRpcSubscriptionNotifications>;
    beforeEach(() => {
        jest.mocked(getNextMessageId).mockReturnValue(0);
        createWebSocketConnection = jest.fn(
            () =>
                new Promise(() => {
                    /* never resolve */
                })
        );
        rpc = createJsonSubscriptionRpc({
            api: {
                // Note the lack of method implementations in the base case.
            } as IRpcSubscriptionsApi<TestRpcSubscriptionNotifications>,
            transport: createWebSocketConnection,
        });
    });
    it('sends a subscription request to the transport', () => {
        rpc.thingNotifications(123).subscribe();
        expect(createWebSocketConnection).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: {
                    ...createJsonRpcMessage('thingSubscribe', [123]),
                    id: expect.any(Number),
                },
            })
        );
    });
    it('returns from the iterator when aborted', async () => {
        expect.assertions(1);
        jest.useFakeTimers();
        const abortController = new AbortController();
        jest.mocked(createWebSocketConnection).mockResolvedValueOnce({
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: jest.fn(async () => {}),
            async *[Symbol.asyncIterator]() {
                yield { id: 0, result: 42 /* subscription id */ };
            },
        });
        const thingNotifications = await rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
        await jest.runAllTimersAsync();
        const iterator = thingNotifications[Symbol.asyncIterator]();
        const thingNotificationPromise = iterator.next();
        abortController.abort();
        await expect(thingNotificationPromise).resolves.toMatchObject({
            done: true,
            value: undefined,
        });
    });
    it('sends an unsubscribe request to the transport when aborted given an established subscription', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        const send = jest.fn(async () => {});
        jest.mocked(createWebSocketConnection).mockResolvedValueOnce({
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: send,
            async *[Symbol.asyncIterator]() {
                yield { id: 0, result: 42 /* subscription id */ };
            },
        });
        await rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
        abortController.abort();
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'thingUnsubscribe',
                params: [42],
            })
        );
    });
    it('does not send an unsubscribe request to the transport when aborted if the subscription has not yet been established', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
        abortController.abort();
        expect(createWebSocketConnection).not.toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    method: 'thingUnsubscribe',
                }),
            })
        );
    });
    it('does not send an unsubscribe request to the transport when the server fatals given an established subscription', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        let killServer: () => void;
        jest.mocked(createWebSocketConnection).mockResolvedValueOnce({
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: jest.fn(async () => {}),
            async *[Symbol.asyncIterator]() {
                yield { id: 0, result: 42 /* subscription id */ };
                yield new Promise((_, reject) => {
                    killServer = reject;
                });
            },
        });
        await rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        killServer();
        expect(createWebSocketConnection).not.toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    method: 'thingUnsubscribe',
                }),
            })
        );
    });
    it('delivers only messages destined for a particular subscription', async () => {
        expect.assertions(1);
        jest.mocked(createWebSocketConnection).mockResolvedValueOnce({
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: jest.fn(async () => {}),
            async *[Symbol.asyncIterator]() {
                yield { id: 0, result: 42 /* subscription id */ };
                yield { params: { result: 123, subscription: 41 } };
                yield { params: { result: 456, subscription: 42 } };
            },
        });
        const thingNotifications = await rpc.thingNotifications().subscribe();
        const iterator = thingNotifications[Symbol.asyncIterator]();
        await expect(iterator.next()).resolves.toHaveProperty('value', 456);
    });
    it.each([null, undefined])(
        'fatals when the subscription id returned from the server is `%s`',
        async subscriptionId => {
            expect.assertions(1);
            jest.mocked(createWebSocketConnection).mockResolvedValueOnce({
                send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: jest.fn(async () => {}),
                async *[Symbol.asyncIterator]() {
                    yield { id: 0, result: subscriptionId /* subscription id */ };
                },
            });
            const thingNotificationsPromise = rpc.thingNotifications().subscribe();
            await expect(thingNotificationsPromise).rejects.toThrow('Failed to obtain a subscription id');
        }
    );
    it("fatals when called with a method that does not end in 'Notifications'", () => {
        expect(() => {
            rpc.nonConformingNotif().subscribe();
        }).toThrow();
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
        jest.mocked(createWebSocketConnection).mockResolvedValueOnce({
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: jest.fn(async () => {}),
            async *[Symbol.asyncIterator]() {
                yield { id: 0, result: undefined /* subscription id */ };
            },
        });
        const subscribePromise = rpc.thingNotifications().subscribe();
        await expect(subscribePromise).rejects.toThrow(/Failed to obtain a subscription id from the server/);
    });
    it('fatals when the server responds with an error', async () => {
        expect.assertions(3);
        jest.mocked(createWebSocketConnection).mockResolvedValueOnce({
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: jest.fn(async () => {}),
            async *[Symbol.asyncIterator]() {
                yield {
                    error: { code: 123, data: 'abc', message: 'o no' },
                    id: 0,
                };
            },
        });
        const subscribePromise = rpc.thingNotifications().subscribe();
        await expect(subscribePromise).rejects.toThrow(SolanaJsonRpcError);
        await expect(subscribePromise).rejects.toThrow(/o no/);
        await expect(subscribePromise).rejects.toMatchObject({ code: 123, data: 'abc' });
    });
    it('throws errors when the connection fails to construct', async () => {
        expect.assertions(1);
        jest.mocked(createWebSocketConnection).mockRejectedValue(new Error('o no'));
        const subscribePromise = rpc.thingNotifications().subscribe();
        await expect(subscribePromise).rejects.toThrow(/o no/);
    });
    it('passes thrown errors from the connection iterable through its own iterable', async () => {
        expect.assertions(1);
        jest.useFakeTimers();
        let killServer: () => void;
        jest.mocked(createWebSocketConnection).mockResolvedValue({
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: jest.fn(async () => {}),
            async *[Symbol.asyncIterator]() {
                yield { id: 0, result: 42 /* subscription id */ };
                yield await new Promise((_, reject) => {
                    killServer = reject;
                });
            },
        });
        const thingNotifications = await rpc.thingNotifications(123).subscribe();
        const thingNotificationsPromise = (async () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _ of thingNotifications);
        })();
        await jest.runAllTimersAsync();
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        killServer(new Error('o no'));
        await expect(thingNotificationsPromise).rejects.toThrow(/o no/);
    });
    describe('when calling a method having a concrete implementation', () => {
        let rpc: RpcSubscriptions<TestRpcSubscriptionNotifications>;
        beforeEach(() => {
            rpc = createJsonSubscriptionRpc({
                api: {
                    nonConformingNotif(...params: unknown[]): RpcSubscription<unknown> {
                        return {
                            params: [...params, 'augmented', 'params'],
                            subscribeMethodName: 'nonConformingSubscribeAugmented',
                            unsubscribeMethodName: 'nonConformingUnsubscribeAugmented',
                        };
                    },
                } as IRpcSubscriptionsApi<TestRpcSubscriptionNotifications>,
                transport: createWebSocketConnection,
            });
        });
        it('converts the returned subscription to a JSON-RPC 2.0 message and sends it to the transport', () => {
            rpc.nonConformingNotif(123).subscribe();
            expect(createWebSocketConnection).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: {
                        ...createJsonRpcMessage('nonConformingSubscribeAugmented', [123, 'augmented', 'params']),
                        id: expect.any(Number),
                    },
                })
            );
        });
        it('uses the returned unsubscribe method name when unsubscribing', async () => {
            expect.assertions(1);
            jest.useFakeTimers();
            const abortController = new AbortController();
            const send = jest.fn(async () => {});
            jest.mocked(createWebSocketConnection).mockResolvedValue({
                send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: send,
                async *[Symbol.asyncIterator]() {
                    yield { id: 0, result: 42 /* subscription id */ };
                },
            });
            await rpc.nonConformingNotif(123).subscribe({ abortSignal: abortController.signal });
            await jest.runAllTimersAsync();
            abortController.abort();
            expect(send).toHaveBeenCalledWith(createJsonRpcMessage('nonConformingUnsubscribeAugmented', [42]));
        });
    });
    describe('when calling a method whose concrete implementation returns a response processor', () => {
        let responseProcessor: jest.Mock;
        let rpc: RpcSubscriptions<TestRpcSubscriptionNotifications>;
        beforeEach(() => {
            responseProcessor = jest.fn(response => `${response} processed response`);
            rpc = createJsonSubscriptionRpc({
                api: {
                    thingNotifications(...params: unknown[]): RpcSubscription<unknown> {
                        return {
                            params,
                            responseProcessor,
                            subscribeMethodName: 'thingSubscribe',
                            unsubscribeMethodName: 'thingUnsubscribe',
                        };
                    },
                } as IRpcSubscriptionsApi<TestRpcSubscriptionNotifications>,
                transport: createWebSocketConnection,
            });
        });
        it('calls the response processor with the response from the JSON-RPC 2.0 endpoint', async () => {
            expect.assertions(1);
            jest.mocked(createWebSocketConnection).mockResolvedValueOnce({
                send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: jest.fn(async () => {}),
                async *[Symbol.asyncIterator]() {
                    yield { id: 0, result: 42 /* subscription id */ };
                    yield { params: { result: 123, subscription: 42 } };
                },
            });
            const thingNotifications = await rpc.thingNotifications().subscribe();
            await thingNotifications[Symbol.asyncIterator]().next();
            expect(responseProcessor).toHaveBeenCalledWith(123);
        });
        it('returns the processed response', async () => {
            expect.assertions(1);
            jest.mocked(createWebSocketConnection).mockResolvedValueOnce({
                send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: jest.fn(async () => {}),
                async *[Symbol.asyncIterator]() {
                    yield { id: 0, result: 42 /* subscription id */ };
                    yield { params: { result: 123, subscription: 42 } };
                },
            });
            const thingNotifications = await rpc.thingNotifications().subscribe();
            await expect(thingNotifications[Symbol.asyncIterator]().next()).resolves.toHaveProperty(
                'value',
                '123 processed response'
            );
        });
    });
});

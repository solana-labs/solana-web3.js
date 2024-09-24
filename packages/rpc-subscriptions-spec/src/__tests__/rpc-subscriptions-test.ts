// import {
//     SOLANA_ERROR__RPC_SUBSCRIPTIONS__CANNOT_CREATE_SUBSCRIPTION_PLAN,
//     SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED,
//     SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID,
//     SolanaError,
// } from '@solana/errors';
// import { createRpcMessage } from '@solana/rpc-spec-types';

// import { createSubscriptionRpc, RpcSubscriptions } from '../rpc-subscriptions';
// import { RpcSubscriptionsApi, RpcSubscriptionsPlan } from '../rpc-subscriptions-api';
// import { RpcSubscriptionsRequest } from '../rpc-subscriptions-request';
// import { RpcSubscriptionsTransport } from '../rpc-subscriptions-transport';
// import { DataPublisher, getDataPublisherFromEventEmitter } from '@solana/subscribable';

// // Partially mock the rpc-spec-types package.
// jest.mock('@solana/rpc-spec-types', () => ({
//     ...jest.requireActual('@solana/rpc-spec-types'),
//     createRpcMessage: jest.fn(),
// }));

// interface TestRpcSubscriptionNotifications {
//     thingNotifications(...args: unknown[]): unknown;
// }

// describe('JSON-RPC 2.0 Subscriptions', () => {
//     let channel: EventTarget;
//     let mockApi: RpcSubscriptionsApi<TestRpcSubscriptionNotifications>;
//     let mockDataPublisher: DataPublisher<Record<string, unknown>>;
//     let mockOn: jest.Mock;
//     let mockSend: jest.Mock<(payload: unknown) => Promise<void>>;
//     let mockSubscriptionPlan: RpcSubscriptionsPlan<TestRpcSubscriptionNotifications>;
//     let mockTransport: jest.Mock;
//     let rpc: RpcSubscriptions<TestRpcSubscriptionNotifications>;
//     beforeEach(() => {
//         jest.mocked(createRpcMessage).mockImplementation(<TParams>(method: string, params: TParams) => ({
//             id: 0,
//             jsonrpc: '2.0',
//             method,
//             params,
//         }));
//         channel = new EventTarget();
//         mockApi = {
//             thingNotifications: jest.fn(),
//         } as RpcSubscriptionsApi<TestRpcSubscriptionNotifications>;
//         mockDataPublisher = getDataPublisherFromEventEmitter(channel);
//         mockOn = jest.fn().mockReturnValue(function unsubscribe() {});
//         mockSubscriptionPlan = {
//             executeSubscriptionPlan: jest.fn().mockResolvedValue(mockDataPublisher),
//             subscriptionConfigurationHash: 'MOCK_HASH',
//         };
//         mockTransport = jest.fn().mockResolvedValue(mockDataPublisher);
//         rpc = createSubscriptionRpc({
//             api: mockApi,
//             transport: mockTransport,
//         });
//     });
//     it('calls the transport with the subscription plan', () => {
//         jest.mocked(mockApi.thingNotifications).mockReturnValue(mockSubscriptionPlan);
//         const abortSignal = new AbortController().signal;
//         rpc.thingNotifications(123).subscribe({ abortSignal });
//         expect(mockTransport).toHaveBeenCalledWith({ ...mockSubscriptionPlan, signal: abortSignal });
//     });
//     it('returns from the iterator when the abort signal fires', async () => {
//         expect.assertions(1);
//         const abortController = new AbortController();
//         const thingNotifications = await rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
//         const iterator = thingNotifications[Symbol.asyncIterator]();
//         const thingNotificationPromise = iterator.next();
//         abortController.abort();
//         await expect(thingNotificationPromise).resolves.toMatchObject({
//             done: true,
//             value: undefined,
//         });
//     });
//     it('returns from the iterator when the abort signal starts aborted', async () => {
//         expect.assertions(1);
//         const abortController = new AbortController();
//         abortController.abort();
//         const thingNotifications = await rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
//         const iterator = thingNotifications[Symbol.asyncIterator]();
//         const thingNotificationPromise = iterator.next();
//         await expect(thingNotificationPromise).resolves.toMatchObject({
//             done: true,
//             value: undefined,
//         });
//     });
//     it('throws from the iterator when the transport publishes an error', async () => {
//         expect.assertions(1);
//         const thingNotifications = await rpc
//             .thingNotifications(123)
//             .subscribe({ abortSignal: new AbortController().signal });
//         const iterator = thingNotifications[Symbol.asyncIterator]();
//         const thingNotificationPromise = iterator.next();
//         channel.dispatchEvent(new CustomEvent('error', { detail: new Error('o no') }));
//         await expect(thingNotificationPromise).rejects.toThrow(
//             new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED, {
//                 cause: new Error('o no'),
//             }),
//         );
//     });
//     it('aborts the transport when aborting the subscription before the subscription has been established', async () => {
//         expect.assertions(2);
//         jest.useFakeTimers();
//         const abortController = new AbortController();
//         rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
//         const [{ signal: transportAbortSignal }] = mockTransport.mock.lastCall!;
//         expect(transportAbortSignal).toHaveProperty('aborted', false);
//         abortController.abort();
//         await jest.runAllTimersAsync();
//         expect(transportAbortSignal).toHaveProperty('aborted', true);
//     });
//     it('aborts the transport when aborting given an established subscription', async () => {
//         expect.assertions(2);
//         jest.useFakeTimers();
//         const abortController = new AbortController();
//         await rpc.thingNotifications(123).subscribe({ abortSignal: abortController.signal });
//         const [{ signal: transportAbortSignal }] = mockTransport.mock.lastCall!;
//         expect(transportAbortSignal).toHaveProperty('aborted', false);
//         abortController.abort();
//         await jest.runAllTimersAsync();
//         expect(transportAbortSignal).toHaveProperty('aborted', true);
//     });
//     it('delivers only messages destined for a particular subscription', async () => {
//         expect.assertions(1);
//         mockOn.mockImplementation(async function* () {
//             yield Promise.resolve({ id: 0, result: 42 /* subscription id */ });
//             yield Promise.resolve({ params: { result: 123, subscription: 41 } });
//             yield Promise.resolve({ params: { result: 456, subscription: 42 } });
//         });
//         const thingNotifications = await rpc
//             .thingNotifications()
//             .subscribe({ abortSignal: new AbortController().signal });
//         const iterator = thingNotifications[Symbol.asyncIterator]();
//         await expect(iterator.next()).resolves.toHaveProperty('value', { result: 456, subscription: 42 });
//     });
//     it.each([null, undefined])(
//         'fatals when the subscription id returned from the server is `%s`',
//         async subscriptionId => {
//             expect.assertions(1);
//             mockOn.mockImplementation(async function* () {
//                 yield Promise.resolve({ id: 0, result: subscriptionId /* subscription id */ });
//             });
//             const thingNotificationsPromise = rpc
//                 .thingNotifications()
//                 .subscribe({ abortSignal: new AbortController().signal });
//             await expect(thingNotificationsPromise).rejects.toThrow(
//                 new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID),
//             );
//         },
//     );
//     it('fatals when called with an already aborted signal', async () => {
//         expect.assertions(1);
//         const abortController = new AbortController();
//         abortController.abort();
//         const subscribePromise = rpc.thingNotifications().subscribe({ abortSignal: abortController.signal });
//         await expect(subscribePromise).rejects.toThrow(/operation was aborted/);
//     });
//     it('fatals when the server fails to respond with a subscription id', async () => {
//         expect.assertions(1);
//         mockOn.mockImplementation(async function* () {
//             yield Promise.resolve({ id: 0, result: undefined /* subscription id */ });
//         });
//         const subscribePromise = rpc.thingNotifications().subscribe({ abortSignal: new AbortController().signal });
//         await expect(subscribePromise).rejects.toThrow(
//             new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID),
//         );
//     });
//     it('fatals when the server responds with an error', async () => {
//         expect.assertions(1);
//         mockOn.mockImplementation(async function* () {
//             yield Promise.resolve({
//                 error: { code: SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID },
//                 id: 0,
//             });
//         });
//         const subscribePromise = rpc.thingNotifications().subscribe({ abortSignal: new AbortController().signal });
//         await expect(subscribePromise).rejects.toThrow(
//             new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__EXPECTED_SERVER_SUBSCRIPTION_ID),
//         );
//     });
//     it('throws errors when the connection fails to construct', async () => {
//         expect.assertions(1);
//         mockTransport.mockRejectedValue(new Error('o no'));
//         const subscribePromise = rpc.thingNotifications().subscribe({ abortSignal: new AbortController().signal });
//         await expect(subscribePromise).rejects.toThrow(/o no/);
//     });
//     describe('when calling a method having a concrete implementation', () => {
//         let rpc: RpcSubscriptions<TestRpcSubscriptionNotifications>;
//         beforeEach(() => {
//             rpc = createSubscriptionRpc({
//                 api: {
//                     nonConformingNotif(...params: unknown[]): RpcSubscriptionsRequest<unknown> {
//                         return {
//                             params: [...params, 'augmented', 'params'],
//                             subscribeMethodName: 'nonConformingSubscribeAugmented',
//                             unsubscribeMethodName: 'nonConformingUnsubscribeAugmented',
//                         };
//                     },
//                 } as RpcSubscriptionsApi<TestRpcSubscriptionNotifications>,
//                 transport: mockTransport,
//             });
//         });
//         it('converts the returned subscription to a JSON-RPC 2.0 message and sends it to the transport', () => {
//             rpc.nonConformingNotif(123).subscribe({ abortSignal: new AbortController().signal });
//             expect(mockTransport).toHaveBeenCalledWith(
//                 expect.objectContaining({
//                     payload: {
//                         ...createRpcMessage('nonConformingSubscribeAugmented', [123, 'augmented', 'params']),
//                         id: expect.any(Number),
//                     },
//                 }),
//             );
//         });
//         it('uses the returned unsubscribe method name when unsubscribing', async () => {
//             expect.assertions(1);
//             jest.useFakeTimers();
//             const abortController = new AbortController();
//             mockOn.mockImplementation(async function* () {
//                 yield { id: 0, result: 42 /* subscription id */ };
//                 yield new Promise(() => {
//                     /* never resolve */
//                 });
//             });
//             await rpc.nonConformingNotif(123).subscribe({ abortSignal: abortController.signal });
//             await jest.runAllTimersAsync();
//             abortController.abort();
//             expect(mockSend).toHaveBeenCalledWith(createRpcMessage('nonConformingUnsubscribeAugmented', [42]));
//         });
//     });
//     describe('when calling a method whose concrete implementation returns a response processor', () => {
//         let responseTransformer: jest.Mock;
//         let rpc: RpcSubscriptions<TestRpcSubscriptionNotifications>;
//         beforeEach(() => {
//             responseTransformer = jest.fn(response => `${response.result} processed response`);
//             rpc = createSubscriptionRpc({
//                 api: {
//                     thingNotifications(...params: unknown[]): RpcSubscriptionsRequest<unknown> {
//                         return {
//                             params,
//                             responseTransformer,
//                             subscribeMethodName: 'thingSubscribe',
//                             unsubscribeMethodName: 'thingUnsubscribe',
//                         };
//                     },
//                 } as RpcSubscriptionsApi<TestRpcSubscriptionNotifications>,
//                 transport: mockTransport,
//             });
//         });
//         it('calls the response processor with the response from the JSON-RPC 2.0 endpoint', async () => {
//             expect.assertions(1);
//             mockOn.mockImplementation(async function* () {
//                 yield Promise.resolve({ id: 0, result: 42 /* subscription id */ });
//                 yield Promise.resolve({ params: { result: 123, subscription: 42 } });
//             });
//             const thingNotifications = await rpc
//                 .thingNotifications()
//                 .subscribe({ abortSignal: new AbortController().signal });
//             await thingNotifications[Symbol.asyncIterator]().next();
//             expect(responseTransformer).toHaveBeenCalledWith({ result: 123, subscription: 42 }, 'thingSubscribe');
//         });
//         it('returns the processed response', async () => {
//             expect.assertions(1);
//             mockOn.mockImplementation(async function* () {
//                 yield Promise.resolve({ id: 0, result: 42 /* subscription id */ });
//                 yield Promise.resolve({ params: { result: 123, subscription: 42 } });
//             });
//             const thingNotifications = await rpc
//                 .thingNotifications()
//                 .subscribe({ abortSignal: new AbortController().signal });
//             await expect(thingNotifications[Symbol.asyncIterator]().next()).resolves.toHaveProperty(
//                 'value',
//                 '123 processed response',
//             );
//         });
//     });
// });

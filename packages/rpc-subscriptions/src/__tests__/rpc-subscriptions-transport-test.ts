import { SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED, SolanaError } from '@solana/errors';

// FIXME
describe('createRpcSubscriptionsTransportFromChannelCreator', () => {
    let abortController: AbortController;
    let createChannel: jest.Mock;
    let mockOn: jest.Mock;
    let mockSubscriptionPlan: RpcSubscriptionsPlan<never>;
    let send: jest.Mock;
    let sendInitialMessage: RpcSubscriptionsTransport;
    function receiveError(e: unknown) {
        mockOn.mock.calls
            .filter(([type]) => type === 'error')
            .forEach(([_, listener]) => {
                listener(e);
            });
    }
    function receiveMessage(message: unknown) {
        mockOn.mock.calls
            .filter(([type]) => type === 'message')
            .forEach(([_, listener]) => {
                listener(message);
            });
    }
    beforeEach(() => {
        abortController = new AbortController();
        mockSubscriptionPlan = {
            executeSubscriptionPlan: jest.fn(),
            subscriptionConfigurationHash: 'MOCK_HASH',
        };
        mockOn = jest.fn().mockReturnValue(function unsubscribe() {});
        send = jest.fn();
        createChannel = jest.fn().mockReturnValue({
            on: mockOn,
            send,
        });
        sendInitialMessage = { createChannel };
    });
    it('creates a connection when called', () => {
        expect.assertions(1);
        sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        expect(createChannel).toHaveBeenCalled();
    });
    it('suspends until the socket is connected', async () => {
        expect.assertions(2);
        jest.useFakeTimers();
        let resolveConnection!: CallableFunction;
        jest.mocked(createChannel).mockReturnValue(
            new Promise(r => {
                resolveConnection = r;
            }),
        );
        const transportPromise = sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        await expect(Promise.race([transportPromise, 'pending'])).resolves.toBe('pending');
        resolveConnection({
            addErrorListener: mockAddErrorListener,
            addMessageListener: mockAddMessageListener,
            send,
        });
        await jest.runAllTimersAsync();
        await expect(Promise.race([transportPromise, 'pending'])).resolves.not.toBe('pending');
    });
    it('forwards the initial message to the underlying connection', async () => {
        expect.assertions(1);
        await sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        expect(send).toHaveBeenCalledWith('hello');
    });
    it("throws in the event the underlying connection's send throws", async () => {
        expect.assertions(1);
        send.mockRejectedValue('o no');
        const sendPromise = sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        await expect(sendPromise).rejects.toBe('o no');
    });
    it('throws if the signal is already aborted', async () => {
        expect.assertions(1);
        abortController.abort();
        await expect(sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal })).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED, {
                cause: abortController.signal.reason,
            }),
        );
    });
    it('throws if the signal is aborted after the socket connects but before the message is sent', async () => {
        expect.assertions(1);
        jest.mocked(createChannel).mockImplementation(() => {
            abortController.abort();
            return Promise.resolve({
                addErrorListener: mockAddErrorListener,
                addMessageListener: mockAddMessageListener,
                send,
            });
        });
        const sendPromise = sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        await expect(sendPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED, {
                cause: abortController.signal.reason,
            }),
        );
    });
    it('throws if the send fatals', async () => {
        expect.assertions(1);
        send.mockRejectedValue(new Error('o no'));
        const sendPromise = sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        await expect(sendPromise).rejects.toThrow();
    });
    it('throws if the socket fails to connect', async () => {
        expect.assertions(1);
        jest.mocked(createChannel).mockRejectedValue(new Error('o no'));
        const transportPromise = sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        await expect(transportPromise).rejects.toThrow();
    });
    it('vends messages received immediately after the first poll event in the same runloop', async () => {
        expect.assertions(1);
        const iterable = await sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        const iterator = iterable[Symbol.asyncIterator]();
        const messagePromise = iterator.next(); // First poll
        receiveMessage('hi there'); // Message received in same runloop
        await expect(messagePromise).resolves.toHaveProperty('value', 'hi there');
    });
    it('vends a message to consumers who have already polled for a result', async () => {
        expect.assertions(2);
        const iterable = await sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        const iteratorA = iterable[Symbol.asyncIterator]();
        const iteratorB = iterable[Symbol.asyncIterator]();
        const resultPromiseA = iteratorA.next();
        const resultPromiseB = iteratorB.next();
        const expectedMessage = 'hello';
        receiveMessage(expectedMessage);
        await expect(resultPromiseA).resolves.toMatchObject({ done: false, value: expectedMessage });
        await expect(resultPromiseB).resolves.toMatchObject({ done: false, value: expectedMessage });
    });
    it('does not queue messages for a consumer until it has started to poll', async () => {
        expect.assertions(3);
        const iterable = await sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        const iterator = iterable[Symbol.asyncIterator]();
        receiveMessage({ some: 'lost message' });
        const resultPromise = iterator.next();
        receiveMessage({ some: 'immediately delivered message' });
        await expect(resultPromise).resolves.toMatchObject({
            done: false,
            value: { some: 'immediately delivered message' },
        });
        receiveMessage({ some: 'queued message 1' });
        receiveMessage({ some: 'queued message 2' });
        await expect(iterator.next()).resolves.toMatchObject({
            done: false,
            value: { some: 'queued message 1' },
        });
        await expect(iterator.next()).resolves.toMatchObject({
            done: false,
            value: { some: 'queued message 2' },
        });
    });
    it('returns from the iterator when the transport is aborted', async () => {
        expect.assertions(1);
        const iterable = await sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        const iterator = iterable[Symbol.asyncIterator]();
        const resultPromise = iterator.next();
        abortController.abort();
        await expect(resultPromise).resolves.toMatchObject({
            done: true,
            value: undefined,
        });
    });
    it('drops messages received after the transport is aborted', async () => {
        expect.assertions(1);
        const iterable = await sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        const iterator = iterable[Symbol.asyncIterator]();
        const resultPromise = iterator.next();
        abortController.abort();
        receiveMessage('hello');
        await expect(resultPromise).resolves.toMatchObject({
            done: true,
            value: undefined,
        });
    });
    it('throws from the iterator when the connection encounters an error', async () => {
        expect.assertions(1);
        const iterable = await sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
        const iterator = iterable[Symbol.asyncIterator]();
        const resultPromise = iterator.next();
        const errorDetails = {
            code: 1006 /* abnormal closure */,
            reason: 'o no',
            wasClean: false,
        };
        receiveError(errorDetails);
        await expect(resultPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED, {
                cause: expect.objectContaining(errorDetails),
            }),
        );
    });
    describe('given an open transport', () => {
        let transport: Awaited<ReturnType<RpcSubscriptionsTransport>>;
        beforeEach(async () => {
            transport = await sendInitialMessage({ ...mockSubscriptionPlan, signal: abortController.signal });
            send.mockClear();
        });
        it('forwards subsequent messages to the underlying connection', () => {
            transport.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED('ping');
            expect(send).toHaveBeenCalledWith('ping');
        });
        it("throws in the event the underlying connection's send throws", async () => {
            expect.assertions(1);
            send.mockRejectedValue('o no');
            const sendPromise = transport.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED('hello');
            await expect(sendPromise).rejects.toBe('o no');
        });
    });
});

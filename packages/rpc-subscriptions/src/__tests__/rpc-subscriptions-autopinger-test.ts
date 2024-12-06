import { SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED, SolanaError } from '@solana/errors';
import { RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';

import { getRpcSubscriptionsChannelWithAutoping } from '../rpc-subscriptions-autopinger';

const MOCK_INTERVAL_MS = 60_000;

describe('getRpcSubscriptionsChannelWithAutoping', () => {
    let mockChannel: RpcSubscriptionsChannel<unknown, unknown>;
    let mockOn: jest.Mock;
    let mockSend: jest.Mock;
    let mockWindowAddEventListener: jest.Mock;
    let originalWindowAddEventListener: typeof globalThis.addEventListener;
    function receiveError(error?: unknown) {
        mockOn.mock.calls.filter(([type]) => type === 'error').forEach(([_, listener]) => listener(error));
    }
    function receiveMessage(message: unknown) {
        mockOn.mock.calls.filter(([type]) => type === 'message').forEach(([_, listener]) => listener(message));
    }
    function dispatchWindowEvent(eventName: 'offline' | 'online') {
        mockWindowAddEventListener.mock.calls
            .filter(([type]) => type === eventName)
            .forEach(([_, listener]) => listener());
    }
    beforeEach(() => {
        jest.useFakeTimers();
        if (__BROWSER__) {
            originalWindowAddEventListener = globalThis.addEventListener;
            globalThis.addEventListener = mockWindowAddEventListener = jest.fn();
        }
        mockOn = jest.fn().mockReturnValue(() => {});
        mockSend = jest.fn().mockResolvedValue(void 0);
        mockChannel = {
            on: mockOn,
            send: mockSend,
        };
    });
    afterEach(() => {
        if (__BROWSER__) {
            globalThis.addEventListener = originalWindowAddEventListener;
        }
    });
    it('sends a ping message to the channel at the specified interval', async () => {
        expect.assertions(4);
        getRpcSubscriptionsChannelWithAutoping({
            abortSignal: new AbortController().signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        // First ping.
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS - 1);
        expect(mockSend).not.toHaveBeenCalled();
        await jest.advanceTimersByTimeAsync(1);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
        // Second ping.
        mockSend.mockClear();
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS - 1);
        expect(mockSend).not.toHaveBeenCalled();
        await jest.advanceTimersByTimeAsync(1);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
    });
    it('continues to ping even though send fataled with a non-connection-closed exception', async () => {
        expect.assertions(1);
        mockSend.mockRejectedValue(
            // Anything other than `SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED`.
            'o no',
        );
        getRpcSubscriptionsChannelWithAutoping({
            abortSignal: new AbortController().signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        // First ping.
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS);
        // Second ping.
        mockSend.mockClear();
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
    });
    it('does not send a ping until interval milliseconds after the last sent message', async () => {
        expect.assertions(3);
        const autopingChannel = getRpcSubscriptionsChannelWithAutoping({
            abortSignal: new AbortController().signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        autopingChannel.send('hi').catch(() => {});
        mockSend.mockClear();
        await jest.advanceTimersByTimeAsync(500);
        expect(mockSend).not.toHaveBeenCalled();
        autopingChannel.send('hi').catch(() => {});
        mockSend.mockClear();
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS - 1);
        expect(mockSend).not.toHaveBeenCalled();
        await jest.advanceTimersByTimeAsync(1);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
    });
    it('does not send a ping until interval milliseconds after the last received message', async () => {
        expect.assertions(3);
        getRpcSubscriptionsChannelWithAutoping({
            abortSignal: new AbortController().signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        await jest.advanceTimersByTimeAsync(500);
        expect(mockSend).not.toHaveBeenCalled();
        receiveMessage('hi');
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS - 1);
        expect(mockSend).not.toHaveBeenCalled();
        await jest.advanceTimersByTimeAsync(1);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
    });
    it('does not send a ping after a channel error', async () => {
        expect.assertions(2);
        getRpcSubscriptionsChannelWithAutoping({
            abortSignal: new AbortController().signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        // First ping.
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
        receiveError('o no');
        // No more pings.
        mockSend.mockClear();
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS);
        expect(mockSend).not.toHaveBeenCalled();
    });
    it('does not send a ping after send fatals with a connection closed error', async () => {
        expect.assertions(1);
        mockSend.mockRejectedValue(new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED));
        getRpcSubscriptionsChannelWithAutoping({
            abortSignal: new AbortController().signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        // First ping.
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS);
        // No more pings.
        mockSend.mockClear();
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS);
        expect(mockSend).not.toHaveBeenCalled();
    });
    it('does not send a ping after the abort signal fires', async () => {
        expect.assertions(2);
        const abortController = new AbortController();
        getRpcSubscriptionsChannelWithAutoping({
            abortSignal: abortController.signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        // First ping.
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
        abortController.abort();
        // No more pings.
        mockSend.mockClear();
        await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS);
        expect(mockSend).not.toHaveBeenCalled();
    });
    if (__BROWSER__) {
        it('stops pinging the connection when it goes offline', async () => {
            expect.assertions(1);
            getRpcSubscriptionsChannelWithAutoping({
                abortSignal: new AbortController().signal,
                channel: mockChannel,
                intervalMs: MOCK_INTERVAL_MS,
            });
            dispatchWindowEvent('offline');
            await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS);
            expect(mockSend).not.toHaveBeenCalled();
        });
        describe('when the network connection is offline to start', () => {
            beforeEach(() => {
                const originalNavigator = globalThis.navigator;
                jest.spyOn(globalThis, 'navigator', 'get').mockImplementation(() => ({
                    ...originalNavigator,
                    onLine: false,
                }));
            });
            it('does not ping the connection', async () => {
                expect.assertions(1);
                getRpcSubscriptionsChannelWithAutoping({
                    abortSignal: new AbortController().signal,
                    channel: mockChannel,
                    intervalMs: MOCK_INTERVAL_MS,
                });
                await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS);
                expect(mockSend).not.toHaveBeenCalled();
            });
            it('pings the connection immediately when the connection comes back online', async () => {
                expect.assertions(1);
                getRpcSubscriptionsChannelWithAutoping({
                    abortSignal: new AbortController().signal,
                    channel: mockChannel,
                    intervalMs: MOCK_INTERVAL_MS,
                });
                await jest.advanceTimersByTimeAsync(500);
                dispatchWindowEvent('online');
                expect(mockSend).toHaveBeenCalledWith(
                    expect.objectContaining({
                        jsonrpc: '2.0',
                        method: 'ping',
                    }),
                );
            });
            it('pings the connection interval milliseconds after the connection comes back online', async () => {
                expect.assertions(3);
                getRpcSubscriptionsChannelWithAutoping({
                    abortSignal: new AbortController().signal,
                    channel: mockChannel,
                    intervalMs: MOCK_INTERVAL_MS,
                });
                await jest.advanceTimersByTimeAsync(500);
                dispatchWindowEvent('online');
                mockSend.mockClear();
                expect(mockSend).not.toHaveBeenCalled();
                await jest.advanceTimersByTimeAsync(MOCK_INTERVAL_MS - 1);
                expect(mockSend).not.toHaveBeenCalled();
                await jest.advanceTimersByTimeAsync(1);
                expect(mockSend).toHaveBeenCalledWith(
                    expect.objectContaining({
                        jsonrpc: '2.0',
                        method: 'ping',
                    }),
                );
            });
        });
    }
});

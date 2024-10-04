import { RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';

import { getRpcSubscriptionsChannelWithAutoping } from '../rpc-subscriptions-autopinger';

const MOCK_INTERVAL_MS = 60_000;

describe('getRpcSubscriptionsChannelWithAutoping', () => {
    let mockChannel: RpcSubscriptionsChannel<unknown, unknown>;
    let mockOn: jest.Mock;
    let mockSend: jest.Mock;
    function receiveError(error?: unknown) {
        mockOn.mock.calls.filter(([type]) => type === 'error').forEach(([_, listener]) => listener(error));
    }
    function receiveMessage(message: unknown) {
        mockOn.mock.calls.filter(([type]) => type === 'message').forEach(([_, listener]) => listener(message));
    }
    beforeEach(() => {
        jest.useFakeTimers();
        mockOn = jest.fn().mockReturnValue(() => {});
        mockSend = jest.fn();
        mockChannel = {
            on: mockOn,
            send: mockSend,
        };
    });
    it('sends a ping message to the channel at the specified interval', () => {
        getRpcSubscriptionsChannelWithAutoping({
            abortSignal: new AbortController().signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        // First ping.
        jest.advanceTimersByTime(MOCK_INTERVAL_MS - 1);
        expect(mockSend).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
        // Second ping.
        mockSend.mockClear();
        jest.advanceTimersByTime(MOCK_INTERVAL_MS - 1);
        expect(mockSend).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
    });
    it('does not send a ping until interval milliseconds after the last sent message', () => {
        const autopingChannel = getRpcSubscriptionsChannelWithAutoping({
            abortSignal: new AbortController().signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        autopingChannel.send('hi');
        mockSend.mockReset();
        jest.advanceTimersByTime(500);
        expect(mockSend).not.toHaveBeenCalled();
        autopingChannel.send('hi');
        mockSend.mockClear();
        jest.advanceTimersByTime(MOCK_INTERVAL_MS - 1);
        expect(mockSend).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
    });
    it('does not send a ping until interval milliseconds after the last received message', () => {
        getRpcSubscriptionsChannelWithAutoping({
            abortSignal: new AbortController().signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        jest.advanceTimersByTime(500);
        expect(mockSend).not.toHaveBeenCalled();
        receiveMessage('hi');
        jest.advanceTimersByTime(MOCK_INTERVAL_MS - 1);
        expect(mockSend).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
    });
    it('does not send a ping after a channel error', () => {
        getRpcSubscriptionsChannelWithAutoping({
            abortSignal: new AbortController().signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        // First ping.
        jest.advanceTimersByTime(MOCK_INTERVAL_MS);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
        receiveError('o no');
        // No more pings.
        mockSend.mockClear();
        jest.advanceTimersByTime(MOCK_INTERVAL_MS);
        expect(mockSend).not.toHaveBeenCalled();
    });
    it('does not send a ping after the abort signal fires', () => {
        const abortController = new AbortController();
        getRpcSubscriptionsChannelWithAutoping({
            abortSignal: abortController.signal,
            channel: mockChannel,
            intervalMs: MOCK_INTERVAL_MS,
        });
        // First ping.
        jest.advanceTimersByTime(MOCK_INTERVAL_MS);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
        abortController.abort();
        // No more pings.
        mockSend.mockClear();
        jest.advanceTimersByTime(MOCK_INTERVAL_MS);
        expect(mockSend).not.toHaveBeenCalled();
    });
    if (__BROWSER__) {
        it('stops pinging the connection when it goes offline', () => {
            getRpcSubscriptionsChannelWithAutoping({
                abortSignal: new AbortController().signal,
                channel: mockChannel,
                intervalMs: MOCK_INTERVAL_MS,
            });
            globalThis.window.dispatchEvent(new Event('offline'));
            jest.advanceTimersByTime(MOCK_INTERVAL_MS);
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
            it('does not ping the connection', () => {
                getRpcSubscriptionsChannelWithAutoping({
                    abortSignal: new AbortController().signal,
                    channel: mockChannel,
                    intervalMs: MOCK_INTERVAL_MS,
                });
                jest.advanceTimersByTime(MOCK_INTERVAL_MS);
                expect(mockSend).not.toHaveBeenCalled();
            });
            it('pings the connection immediately when the connection comes back online', () => {
                getRpcSubscriptionsChannelWithAutoping({
                    abortSignal: new AbortController().signal,
                    channel: mockChannel,
                    intervalMs: MOCK_INTERVAL_MS,
                });
                jest.advanceTimersByTime(500);
                globalThis.window.dispatchEvent(new Event('online'));
                expect(mockSend).toHaveBeenCalledWith(
                    expect.objectContaining({
                        jsonrpc: '2.0',
                        method: 'ping',
                    }),
                );
            });
            it('pings the connection interval milliseconds after the connection comes back online', () => {
                getRpcSubscriptionsChannelWithAutoping({
                    abortSignal: new AbortController().signal,
                    channel: mockChannel,
                    intervalMs: MOCK_INTERVAL_MS,
                });
                jest.advanceTimersByTime(500);
                globalThis.window.dispatchEvent(new Event('online'));
                mockSend.mockClear();
                expect(mockSend).not.toHaveBeenCalled();
                jest.advanceTimersByTime(MOCK_INTERVAL_MS - 1);
                expect(mockSend).not.toHaveBeenCalled();
                jest.advanceTimersByTime(1);
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

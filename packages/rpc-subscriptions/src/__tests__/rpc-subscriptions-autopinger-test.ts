import { RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';

import { getWebSocketTransportWithAutoping } from '../rpc-subscriptions-autopinger';

jest.mock('@solana/rpc-subscriptions-transport-websocket');

const MOCK_INTERVAL_MS = 60_000;

describe('getWebSocketTransportWithAutoping', () => {
    let killConnection: () => void;
    let mockInnerTransport: jest.Mock;
    let receiveMessage: (value: unknown) => void;
    let returnFromConnection: () => void;
    let send: jest.Mock;
    let transport: RpcSubscriptionsTransport;
    beforeEach(() => {
        jest.useFakeTimers();
        send = jest.fn();
        let resultPromise;
        mockInnerTransport = jest.fn(() => ({
            // eslint-disable-next-line @typescript-eslint/require-await
            async *[Symbol.asyncIterator]() {
                try {
                    while (true) {
                        yield (resultPromise ||= new Promise((resolve, reject) => {
                            killConnection = () => {
                                reject('error');
                            };
                            receiveMessage = resolve;
                            returnFromConnection = () => {
                                reject();
                            };
                        }));
                        resultPromise = null;
                    }
                } catch (e) {
                    if (e === 'error') {
                        throw e;
                    }
                    return;
                }
            },
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: send,
        }));
        transport = getWebSocketTransportWithAutoping({
            intervalMs: MOCK_INTERVAL_MS,
            transport: mockInnerTransport,
        });
    });
    it('sends a ping message to the active connection at the specified interval', async () => {
        expect.assertions(4);
        await transport({ payload: 'hi', signal: new AbortController().signal });
        // First ping.
        jest.advanceTimersByTime(MOCK_INTERVAL_MS - 1);
        expect(send).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
        // Second ping.
        send.mockClear();
        jest.advanceTimersByTime(MOCK_INTERVAL_MS - 1);
        expect(send).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
    });
    it('does not send a ping until interval milliseconds after the last sent message', async () => {
        expect.assertions(3);
        const connection = await transport({ payload: 'hi', signal: new AbortController().signal });
        jest.advanceTimersByTime(500);
        expect(send).not.toHaveBeenCalled();
        connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED('hi');
        send.mockClear();
        jest.advanceTimersByTime(MOCK_INTERVAL_MS - 1);
        expect(send).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
    });
    it('does not send a ping until interval milliseconds after the last received message', async () => {
        expect.assertions(3);
        await transport({ payload: 'hi', signal: new AbortController().signal });
        jest.advanceTimersByTime(500);
        expect(send).not.toHaveBeenCalled();
        receiveMessage('hi');
        await Promise.resolve(); // Flush Promise queue.
        await Promise.resolve(); // Flush Promise queue.
        jest.advanceTimersByTime(MOCK_INTERVAL_MS - 1);
        expect(send).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
    });
    it('does not send a ping after the connection throws', async () => {
        expect.assertions(2);
        await transport({ payload: 'hi', signal: new AbortController().signal });
        // First ping.
        jest.advanceTimersByTime(MOCK_INTERVAL_MS);
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
        killConnection();
        await jest.runAllTimersAsync();
        // No more pings.
        send.mockClear();
        jest.advanceTimersByTime(MOCK_INTERVAL_MS);
        expect(send).not.toHaveBeenCalled();
    });
    it('does not send a ping after the connection returns', async () => {
        expect.assertions(2);
        await transport({ payload: 'hi', signal: new AbortController().signal });
        // First ping.
        jest.advanceTimersByTime(MOCK_INTERVAL_MS);
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonrpc: '2.0',
                method: 'ping',
            }),
        );
        returnFromConnection();
        await jest.runAllTimersAsync();
        // No more pings.
        send.mockClear();
        jest.advanceTimersByTime(MOCK_INTERVAL_MS);
        expect(send).not.toHaveBeenCalled();
    });
    if (__BROWSER__) {
        it('stops pinging the connection when it goes offline', async () => {
            expect.assertions(1);
            await transport({ payload: 'hi', signal: new AbortController().signal });
            globalThis.window.dispatchEvent(new Event('offline'));
            jest.advanceTimersByTime(MOCK_INTERVAL_MS);
            expect(send).not.toHaveBeenCalled();
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
                await transport({ payload: 'hi', signal: new AbortController().signal });
                jest.advanceTimersByTime(MOCK_INTERVAL_MS);
                expect(send).not.toHaveBeenCalled();
            });
            it('pings the connection immediately when the connection comes back online', async () => {
                expect.assertions(1);
                await transport({ payload: 'hi', signal: new AbortController().signal });
                jest.advanceTimersByTime(500);
                globalThis.window.dispatchEvent(new Event('online'));
                expect(send).toHaveBeenCalledWith(
                    expect.objectContaining({
                        jsonrpc: '2.0',
                        method: 'ping',
                    }),
                );
            });
            it('pings the connection interval milliseconds after the connection comes back online', async () => {
                expect.assertions(3);
                await transport({ payload: 'hi', signal: new AbortController().signal });
                jest.advanceTimersByTime(500);
                globalThis.window.dispatchEvent(new Event('online'));
                send.mockClear();
                expect(send).not.toHaveBeenCalled();
                jest.advanceTimersByTime(MOCK_INTERVAL_MS - 1);
                expect(send).not.toHaveBeenCalled();
                jest.advanceTimersByTime(1);
                expect(send).toHaveBeenCalledWith(
                    expect.objectContaining({
                        jsonrpc: '2.0',
                        method: 'ping',
                    }),
                );
            });
        });
    }
});

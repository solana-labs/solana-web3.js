import {
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CLOSED_BEFORE_MESSAGE_BUFFERED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_FAILED_TO_CONNECT,
    SolanaError,
} from '@solana/errors';
import { RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';
import WS from 'jest-websocket-mock';
import { Client } from 'mock-socket';

import { createWebSocketChannel } from '../websocket-channel';

const MOCK_SEND_BUFFER_HIGH_WATERMARK = 42069;

describe('createWebSocketChannel', () => {
    let ws: WS;
    function getLatestClient() {
        const clients = ws.server.clients();
        return clients[clients.length - 1];
    }
    beforeEach(() => {
        ws = new WS('wss://fake', {
            jsonProtocol: false,
        });
    });
    afterEach(() => {
        WS.clean();
    });
    it('does not resolve until the socket is open', async () => {
        expect.assertions(2);
        const channelPromise = createWebSocketChannel({
            sendBufferHighWatermark: 0,
            signal: new AbortController().signal,
            url: 'wss://fake',
        });
        const client = getLatestClient();
        expect(client).toHaveProperty('readyState', WebSocket.CONNECTING);
        await channelPromise;
        expect(client).toHaveProperty('readyState', WebSocket.OPEN);
    });
    it('throws when the socket fails to connect', async () => {
        expect.assertions(1);
        const channelPromise = createWebSocketChannel({
            sendBufferHighWatermark: 0,
            signal: new AbortController().signal,
            url: 'ws://fake', // Wrong URL!
        });
        await expect(channelPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_FAILED_TO_CONNECT, {
                errorEvent: {} as Event,
            }),
        );
    });
    it('throws if the signal is already aborted', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        abortController.abort();
        const channelPromise = createWebSocketChannel({
            sendBufferHighWatermark: 0,
            signal: abortController.signal,
            url: 'ws://fake', // Wrong URL!
        });
        await expect(channelPromise).rejects.toThrow(/operation was aborted/);
    });
    it('throws when the channel is aborted before a connection is established', async () => {
        expect.assertions(2);
        const abortController = new AbortController();
        const channelPromise = createWebSocketChannel({
            sendBufferHighWatermark: 0,
            signal: abortController.signal,
            url: 'wss://fake',
        });
        const client = getLatestClient();
        expect(client).toHaveProperty('readyState', WebSocket.CONNECTING);
        abortController.abort();
        await expect(channelPromise).rejects.toThrow(/operation was aborted/);
    });
});

describe('a websocket channel', () => {
    let abortController: AbortController;
    let channelPromise: Promise<RpcSubscriptionsChannel<ArrayBufferLike | ArrayBufferView | Blob | string, string>>;
    let ws: WS;
    function getLatestClient() {
        const clients = ws.server.clients();
        return clients[clients.length - 1];
    }
    beforeEach(() => {
        abortController = new AbortController();
        ws = new WS('wss://fake', {
            jsonProtocol: false,
        });
        channelPromise = createWebSocketChannel({
            sendBufferHighWatermark: MOCK_SEND_BUFFER_HIGH_WATERMARK,
            signal: abortController.signal,
            url: 'wss://fake',
        });
    });
    afterEach(() => {
        WS.clean();
    });
    describe('given an open connection', () => {
        let channel: RpcSubscriptionsChannel<ArrayBufferLike | ArrayBufferView | Blob | string, string>;
        beforeEach(async () => {
            channel = await channelPromise;
        });
        it('publishes messages to message listeners', () => {
            const messageListenerA = jest.fn();
            const messageListenerB = jest.fn();
            channel.on('message', messageListenerB);
            channel.on('message', messageListenerA);
            const expectedMessage = 'message';
            ws.send(expectedMessage);
            expect(messageListenerA).toHaveBeenCalledWith(expectedMessage);
            expect(messageListenerB).toHaveBeenCalledWith(expectedMessage);
        });
        it('does not publish messages received between the time the channel is aborted and the time the connection closes', () => {
            const messageListener = jest.fn();
            channel.on('message', messageListener);
            abortController.abort();
            expect(getLatestClient()).toHaveProperty('readyState', WebSocket.CLOSING);
            ws.send('message');
            expect(messageListener).not.toHaveBeenCalled();
        });
        it('publishes errors to error listeners when the connection closes in an unclean manner', () => {
            const errorListener = jest.fn();
            channel.on('error', errorListener);
            const closeOptions = {
                code: 1006 /* abnormal closure */,
                reason: 'o no',
                wasClean: false,
            };
            ws.close(closeOptions);
            expect(errorListener).toHaveBeenCalledWith(
                new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED, {
                    cause: expect.objectContaining(closeOptions),
                }),
            );
            expect(errorListener.mock.lastCall[0].cause).toMatchObject(closeOptions);
        });
        it('publishes errors to error listeners when the connection closes cleanly with a non-1000 code', () => {
            const errorListener = jest.fn();
            channel.on('error', errorListener);
            const closeOptions = {
                code: 1011 /* internal error */,
                reason: 'o no',
                wasClean: true,
            };
            ws.server.close(closeOptions);
            expect(errorListener).toHaveBeenCalledWith(
                new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED, {
                    cause: expect.objectContaining(closeOptions),
                }),
            );
            expect(errorListener.mock.lastCall[0].cause).toMatchObject(closeOptions);
        });
        it('does not publish errors to error listeners when the connection closes cleanly with a 1000 code', () => {
            const errorListener = jest.fn();
            channel.on('error', errorListener);
            const errorDetails = {
                code: 1000 /* normal closure */,
                reason: 'I enjoyed our little chat',
                wasClean: true,
            };
            ws.error(errorDetails);
            expect(errorListener).not.toHaveBeenCalled();
        });
        it('does not publish errors received between the time the channel is aborted and the time it closes', () => {
            const errorListener = jest.fn();
            channel.on('error', errorListener);
            abortController.abort();
            expect(getLatestClient()).toHaveProperty('readyState', WebSocket.CLOSING);
            ws.error({
                code: 666,
                reason: 'o no',
                wasClean: false,
            });
            expect(errorListener).not.toHaveBeenCalled();
        });
        it('sends a message to the websocket', async () => {
            expect.assertions(1);
            channel.send('message').catch(() => {});
            await expect(ws).toReceiveMessage('message');
        });
        it('throws when sending a message to a closing channel', async () => {
            expect.assertions(2);
            const client = getLatestClient();
            abortController.abort();
            expect(client).toHaveProperty('readyState', WebSocket.CLOSING);
            await expect(channel.send('message')).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED),
            );
        });
        it('throws when sending a message to a closed channel', async () => {
            expect.assertions(2);
            const client = getLatestClient();
            abortController.abort();
            await ws.closed;
            expect(client).toHaveProperty('readyState', WebSocket.CLOSED);
            await expect(channel.send('message')).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED),
            );
        });
        describe('given the send buffer is filled past the high watermark', () => {
            let client: Client;
            let oldBufferedAmount: number;
            beforeEach(async () => {
                client = await ws.connected;
                oldBufferedAmount = client.bufferedAmount;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (client as any).bufferedAmount = MOCK_SEND_BUFFER_HIGH_WATERMARK + 1;
            });
            afterEach(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (client as any).bufferedAmount = oldBufferedAmount;
            });
            it('queues messages until the buffer falls to the high watermark', async () => {
                expect.assertions(2);
                let resolved = false;
                channel
                    .send('message')
                    .then(() => {
                        resolved = true;
                    })
                    .catch(() => {});
                await Promise.resolve(); // Flush Promise queue.
                expect(resolved).toBe(false);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (client as any).bufferedAmount = MOCK_SEND_BUFFER_HIGH_WATERMARK;
                await expect(ws).toReceiveMessage('message');
            });
            it('protects against modification of `ArrayBufferView` messages while queued', async () => {
                expect.assertions(1);
                const message = new Uint8Array(1) satisfies ArrayBufferView;
                message[0] = 42;
                channel.send(message).catch(() => {});
                message[0] = 255; // Some modification
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (client as any).bufferedAmount = MOCK_SEND_BUFFER_HIGH_WATERMARK;
                await expect(ws).toReceiveMessage(new Uint8Array([42]));
            });
            it('fatals when the channel is closed while a message is queued', async () => {
                expect.assertions(1);
                const sendPromise = channel.send('message');
                abortController.abort();
                await expect(sendPromise).rejects.toThrow(
                    new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CLOSED_BEFORE_MESSAGE_BUFFERED),
                );
            });
            it('fatals when the channel encounters an error while a message is queued', async () => {
                expect.assertions(1);
                const sendPromise = channel.send('message');
                ws.error({
                    code: 1006 /* abnormal closure */,
                    reason: 'o no',
                    wasClean: false,
                });
                await expect(sendPromise).rejects.toThrow(
                    new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CLOSED_BEFORE_MESSAGE_BUFFERED),
                );
            });
        });
    });
});

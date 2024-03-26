import {
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_CLOSED_BEFORE_MESSAGE_BUFFERED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_FAILED_TO_CONNECT,
    SolanaError,
} from '@solana/errors';
import WS from 'jest-websocket-mock';
import { Client } from 'mock-socket';

import { createWebSocketConnection, RpcWebSocketConnection } from '../websocket-connection';

const MOCK_SEND_BUFFER_HIGH_WATERMARK = 42069;

describe('createWebSocketConnection', () => {
    let ws: WS;
    function getLatestClient() {
        const clients = ws.server.clients();
        return clients[clients.length - 1];
    }
    beforeEach(() => {
        ws = new WS('wss://fake', {
            jsonProtocol: true,
        });
    });
    afterEach(() => {
        WS.clean();
    });
    it('does not resolve until the socket is open', async () => {
        expect.assertions(2);
        const connectionPromise = createWebSocketConnection({
            sendBufferHighWatermark: 0,
            signal: new AbortController().signal,
            url: 'wss://fake',
        });
        const client = getLatestClient();
        expect(client).toHaveProperty('readyState', WebSocket.CONNECTING);
        await connectionPromise;
        expect(client).toHaveProperty('readyState', WebSocket.OPEN);
    });
    it('throws when the socket fails to connect', async () => {
        expect.assertions(1);
        const connectionPromise = createWebSocketConnection({
            sendBufferHighWatermark: 0,
            signal: new AbortController().signal,
            url: 'ws://fake', // Wrong URL!
        });
        await expect(connectionPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_FAILED_TO_CONNECT, {
                errorEvent: {} as Event,
            }),
        );
    });
    it('throws when the connection is aborted before the connection is established', async () => {
        expect.assertions(2);
        const abortController = new AbortController();
        const connectionPromise = createWebSocketConnection({
            sendBufferHighWatermark: 0,
            signal: abortController.signal,
            url: 'wss://fake',
        });
        const client = getLatestClient();
        expect(client).toHaveProperty('readyState', WebSocket.CONNECTING);
        abortController.abort();
        await expect(connectionPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_FAILED_TO_CONNECT, {
                errorEvent: {} as Event,
            }),
        );
    });
});

describe('RpcWebSocketConnection', () => {
    let abortController: AbortController;
    let connectionPromise: Promise<RpcWebSocketConnection>;
    let ws: WS;
    function getLatestClient() {
        const clients = ws.server.clients();
        return clients[clients.length - 1];
    }
    beforeEach(() => {
        abortController = new AbortController();
        ws = new WS('wss://fake', {
            jsonProtocol: true,
        });
        connectionPromise = createWebSocketConnection({
            sendBufferHighWatermark: MOCK_SEND_BUFFER_HIGH_WATERMARK,
            signal: abortController.signal,
            url: 'wss://fake',
        });
    });
    afterEach(() => {
        WS.clean();
    });
    it('vends messages received immediately after the open event in the same runloop', async () => {
        expect.assertions(2);
        expect(getLatestClient()).toHaveProperty('readyState', WebSocket.CONNECTING);
        ws.on('connection', socket => {
            // Simulate a message event coming in right behind the open event in the event queue.
            setTimeout(() => {
                socket.send(JSON.stringify({ some: 'message' }));
            });
        });
        const connection = await connectionPromise;
        const iterator = connection[Symbol.asyncIterator]();
        await expect(iterator.next()).resolves.toHaveProperty('value', { some: 'message' });
    });
    describe('given an open connection', () => {
        let connection: RpcWebSocketConnection;
        beforeEach(async () => {
            connection = await connectionPromise;
        });
        it('vends a message to consumers who have already polled for a result', async () => {
            expect.assertions(2);
            const iteratorA = connection[Symbol.asyncIterator]();
            const iteratorB = connection[Symbol.asyncIterator]();
            const resultPromiseA = iteratorA.next();
            const resultPromiseB = iteratorB.next();
            const expectedMessage = { some: 'message' };
            ws.send(expectedMessage);
            await expect(resultPromiseA).resolves.toMatchObject({ done: false, value: expectedMessage });
            await expect(resultPromiseB).resolves.toMatchObject({ done: false, value: expectedMessage });
        });
        it('does not queue messages for a consumer until it has started to poll', async () => {
            expect.assertions(3);
            const iterator = connection[Symbol.asyncIterator]();
            ws.send({ some: 'lost message' });
            const resultPromise = iterator.next();
            ws.send({ some: 'immediately delivered message' });
            await expect(resultPromise).resolves.toMatchObject({
                done: false,
                value: { some: 'immediately delivered message' },
            });
            ws.send({ some: 'queued message 1' });
            ws.send({ some: 'queued message 2' });
            await expect(iterator.next()).resolves.toMatchObject({
                done: false,
                value: { some: 'queued message 1' },
            });
            await expect(iterator.next()).resolves.toMatchObject({
                done: false,
                value: { some: 'queued message 2' },
            });
        });
        it('returns from the iterator when the connection is aborted', async () => {
            expect.assertions(1);
            const iterator = connection[Symbol.asyncIterator]();
            const resultPromise = iterator.next();
            abortController.abort();
            await expect(resultPromise).resolves.toMatchObject({
                done: true,
                value: undefined,
            });
        });
        it('drops messages received between the time a connection is aborted and the time it closes', async () => {
            expect.assertions(1);
            const iterator = connection[Symbol.asyncIterator]();
            const resultPromise = iterator.next();
            abortController.abort();
            ws.send({ some: 'message' });
            await expect(resultPromise).resolves.toMatchObject({
                done: true,
                value: undefined,
            });
        });
        it('throws from the iterator when the connection encounters an error', async () => {
            expect.assertions(1);
            const iterator = connection[Symbol.asyncIterator]();
            const resultPromise = iterator.next();
            ws.error({
                code: 1006 /* abnormal closure */,
                reason: 'o no',
                wasClean: false,
            });
            await expect(resultPromise).rejects.toThrow();
        });
        it('sends a message to the websocket', async () => {
            expect.assertions(1);
            connection.send({ some: 'message' });
            await expect(ws).toReceiveMessage({ some: 'message' });
        });
        it('does not fatal when sending a message to a closing connection', async () => {
            expect.assertions(2);
            const client = getLatestClient();
            abortController.abort();
            expect(client).toHaveProperty('readyState', WebSocket.CLOSING);
            await expect(connection.send({ some: 'message' })).resolves.toBeUndefined();
        });
        it('does not fatal when sending a message to a closed connection', async () => {
            expect.assertions(2);
            const client = getLatestClient();
            abortController.abort();
            await ws.closed;
            expect(client).toHaveProperty('readyState', WebSocket.CLOSED);
            await expect(connection.send({ some: 'message' })).resolves.toBeUndefined();
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
                connection.send({ some: 'message' }).then(() => {
                    resolved = true;
                });
                await Promise.resolve(); // Flush Promise queue.
                expect(resolved).toBe(false);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (client as any).bufferedAmount = MOCK_SEND_BUFFER_HIGH_WATERMARK;
                await expect(ws).toReceiveMessage({ some: 'message' });
            });
            it('protects against modification of the message while queued', async () => {
                expect.assertions(1);
                const message = { some: 'message' };
                connection.send(message);
                message.some = 'modified message';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (client as any).bufferedAmount = MOCK_SEND_BUFFER_HIGH_WATERMARK;
                await expect(ws).toReceiveMessage({ some: 'message' });
            });
            it('fatals when the connection is closed while a message is queued', async () => {
                expect.assertions(1);
                const sendPromise = connection.send({ some: 'message' });
                abortController.abort();
                await expect(sendPromise).rejects.toThrow(
                    new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_CLOSED_BEFORE_MESSAGE_BUFFERED),
                );
            });
            it('fatals when the connection encounters an error while a message is queued', async () => {
                expect.assertions(1);
                const sendPromise = connection.send({ some: 'message' });
                ws.error({
                    code: 1006 /* abnormal closure */,
                    reason: 'o no',
                    wasClean: false,
                });
                await expect(sendPromise).rejects.toThrow(
                    new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_CLOSED_BEFORE_MESSAGE_BUFFERED),
                );
            });
        });
    });
});

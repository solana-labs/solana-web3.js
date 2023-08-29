import WS from 'jest-websocket-mock';

import { createWebSocketConnection, RpcWebSocketConnection } from '../websocket-connection';

describe('RpcWebSocketConnection', () => {
    let abortController: AbortController;
    let connection: RpcWebSocketConnection;
    let ws: WS;
    function getLatestClient() {
        const clients = ws.server.clients();
        return clients[clients.length - 1];
    }
    beforeEach(async () => {
        abortController = new AbortController();
        ws = new WS('wss://fake', {
            jsonProtocol: true,
        });
        connection = await createWebSocketConnection({
            signal: abortController.signal,
            url: 'wss://fake',
        });
        await ws.connected;
    });
    afterEach(() => {
        WS.clean();
    });
    it('does not resolve until the socket is open', async () => {
        expect.assertions(2);
        const freshConnectionPromise = createWebSocketConnection({
            signal: abortController.signal,
            url: 'wss://fake',
        });
        const client = getLatestClient();
        expect(client).toHaveProperty('readyState', WebSocket.CONNECTING);
        await freshConnectionPromise;
        expect(client).toHaveProperty('readyState', WebSocket.OPEN);
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
    it('does not queue messsages for a consumer until it has started to poll', async () => {
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
    // See https://github.com/thoov/mock-socket/pull/382
    it.failing('does not fatal when sending a message to a closing connection', async () => {
        expect.assertions(1);
        const client = getLatestClient();
        abortController.abort();
        expect(client).toHaveProperty('readyState', WebSocket.CLOSING);
        await expect(connection.send({ some: 'message' })).resolves.toBeUndefined();
    });
    // See https://github.com/thoov/mock-socket/pull/382
    it.failing('does not fatal when sending a message to a closed connection', async () => {
        expect.assertions(1);
        const client = getLatestClient();
        abortController.abort();
        await ws.closed;
        expect(client).toHaveProperty('readyState', WebSocket.CLOSED);
        await expect(connection.send({ some: 'message' })).resolves.toBeUndefined();
    });
});

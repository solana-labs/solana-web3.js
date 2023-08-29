import WS from 'jest-websocket-mock';

import { IRpcWebSocketTransport } from '../../transport-types';
import { createWebSocketTransport } from '../websocket-transport';

describe('createWebSocketTransport', () => {
    let abortController: AbortController;
    let transport: IRpcWebSocketTransport;
    let ws: WS;
    beforeEach(() => {
        abortController = new AbortController();
        transport = createWebSocketTransport({ url: 'wss://fake' });
        ws = new WS('wss://fake', {
            jsonProtocol: true,
        });
    });
    afterEach(() => {
        WS.clean();
    });
    it('connects to the server', async () => {
        expect.assertions(1);
        transport({ signal: abortController.signal });
        await expect(ws.connected).resolves.toMatchObject({ readyState: WebSocket.OPEN });
    });
    it('suspends until the socket is connected', async () => {
        expect.assertions(2);
        const transportPromise = transport({ signal: abortController.signal });
        expect(ws.server.clients()[0]).toHaveProperty('readyState', WebSocket.CONNECTING);
        await transportPromise;
        expect(ws.server.clients()[0]).toHaveProperty('readyState', WebSocket.OPEN);
    });
    it('throws synchronously if the signal is already aborted', async () => {
        expect.assertions(1);
        abortController.abort();
        await expect(transport({ signal: abortController.signal })).rejects.toThrow('operation was aborted');
    });
    it('throws if the socket fails to construct because of a malformed URL', async () => {
        expect.assertions(1);
        const badTransport = createWebSocketTransport({ url: 'https://notasocket' });
        await expect(badTransport({ signal: abortController.signal })).rejects.toThrow();
    });
    it('throws if the socket fails to connect', async () => {
        expect.assertions(1);
        const connectionPromise = transport({ signal: abortController.signal });
        ws.error({ code: 1006, reason: 'o no', wasClean: false });
        await expect(connectionPromise).rejects.toThrow();
    });
});

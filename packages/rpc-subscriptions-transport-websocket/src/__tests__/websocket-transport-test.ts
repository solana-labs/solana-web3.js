import { RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';

import { createWebSocketConnection } from '../websocket-connection';
import { createWebSocketTransport } from '../websocket-transport';

jest.mock('../websocket-connection');

describe('createWebSocketTransport', () => {
    it.each(['gopher://', 'http://', 'https://', 'mailto:'])('throws if the URL begins with `%s`', protocol => {
        expect(() => {
            createWebSocketTransport({
                sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                url: `${protocol}socket`,
            });
        }).toThrow(`'${protocol.split(':')[0]}:' is not allowed`);
    });
    it('throws if the URL has no protocol', () => {
        expect(() => {
            createWebSocketTransport({
                sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                url: `garbage`,
            });
        }).toThrow("'garbage' is invalid");
    });
    it.each(['ws://', 'wss://', 'ws:', 'wss:', 'wS://', 'wSs://'])(
        'does not throw if the URL begins with `%s`',
        protocol => {
            expect(() => {
                createWebSocketTransport({
                    sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                    url: `${protocol}socket`,
                });
            }).not.toThrow();
        },
    );
});

describe('RpcSubscriptionsTransport', () => {
    let abortController: AbortController;
    let iterator: jest.Mock;
    let send: jest.Mock;
    let sendWebSocketMessage: RpcSubscriptionsTransport;
    beforeEach(() => {
        abortController = new AbortController();
        iterator = jest.fn();
        send = jest.fn();
        jest.mocked(createWebSocketConnection).mockResolvedValue({
            [Symbol.asyncIterator]: iterator,
            send,
        });
        sendWebSocketMessage = createWebSocketTransport({
            sendBufferHighWatermark: Number.POSITIVE_INFINITY,
            url: 'wss://fake',
        });
    });
    it('creates a connection when called', () => {
        expect.assertions(1);
        sendWebSocketMessage({ payload: 'hello', signal: abortController.signal });
        expect(createWebSocketConnection).toHaveBeenCalled();
    });
    it('suspends until the socket is connected', async () => {
        expect.assertions(2);
        jest.useFakeTimers();
        let resolveConnection: CallableFunction;
        jest.mocked(createWebSocketConnection).mockReturnValue(
            new Promise(r => {
                resolveConnection = r;
            }),
        );
        const transportPromise = sendWebSocketMessage({ payload: 'hello', signal: abortController.signal });
        await expect(Promise.race([transportPromise, 'pending'])).resolves.toBe('pending');
        // https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resolveConnection({
            [Symbol.asyncIterator]: iterator,
            send,
        });
        await jest.runAllTimersAsync();
        await expect(Promise.race([transportPromise, 'pending'])).resolves.not.toBe('pending');
    });
    it('forwards messages to the underlying connection', async () => {
        expect.assertions(1);
        const connection = await sendWebSocketMessage({ payload: 'hello', signal: abortController.signal });
        send.mockClear();
        connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED('ping');
        expect(send).toHaveBeenCalledWith('ping');
    });
    it('throws if the signal is already aborted', async () => {
        expect.assertions(1);
        abortController.abort();
        await expect(sendWebSocketMessage({ payload: 'hello', signal: abortController.signal })).rejects.toThrow(
            'operation was aborted',
        );
    });
    it('throws if the signal is aborted after the socket connects but before the message is sent', async () => {
        expect.assertions(1);
        jest.mocked(createWebSocketConnection).mockImplementation(() => {
            abortController.abort();
            return Promise.resolve({
                [Symbol.asyncIterator]: iterator,
                send,
            });
        });
        const sendPromise = sendWebSocketMessage({ payload: 'hello', signal: abortController.signal });
        await expect(sendPromise).rejects.toThrow('operation was aborted');
    });
    it('throws if the send fatals', async () => {
        expect.assertions(1);
        send.mockRejectedValue(new Error('o no'));
        const sendPromise = sendWebSocketMessage({ payload: 'hello', signal: abortController.signal });
        await expect(sendPromise).rejects.toThrow();
    });
    it('throws if the socket fails to connect', async () => {
        expect.assertions(1);
        jest.mocked(createWebSocketConnection).mockRejectedValue(new Error('o no'));
        const connectionPromise = sendWebSocketMessage({ payload: 'hello', signal: abortController.signal });
        await expect(connectionPromise).rejects.toThrow();
    });
});

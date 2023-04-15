import { makeHttpRequest } from '../../http-request';
import { createJsonRpcTransport } from '../index';
import { SolanaJsonRpcError } from '../json-rpc-errors';
import { createJsonRpcMessage } from '../json-rpc-message';
import { getNextMessageId } from '../json-rpc-message-id';
import { IRpcApi, Transport, TransportRequest } from '../json-rpc-transport-types';

jest.mock('../../http-request');
jest.mock('../json-rpc-message-id');

interface TestRpcMethods {
    someMethod(...args: unknown[]): unknown;
}

const CUSTOM_HEADERS = {
    'My-Custom-Header': 'custom',
} as const;
const FAKE_URL = 'fake://url';

describe('JSON-RPC 2.0 transport', () => {
    let transport: Transport<TestRpcMethods>;
    beforeEach(() => {
        transport = createJsonRpcTransport({
            api: {
                // Note the lack of method implementations in the base case.
            } as IRpcApi<TestRpcMethods>,
            headers: CUSTOM_HEADERS,
            url: FAKE_URL,
        });
        (makeHttpRequest as jest.Mock).mockImplementation(
            () =>
                new Promise(_ => {
                    /* never resolve */
                })
        );
        let counter = 0;
        (getNextMessageId as jest.Mock).mockImplementation(() => counter++);
    });
    it('sends a request to a JSON-RPC 2.0 endpoint', () => {
        transport.someMethod(123).send();
        expect(makeHttpRequest).toHaveBeenCalledWith({
            headers: CUSTOM_HEADERS,
            payload: { ...createJsonRpcMessage('someMethod', [123]), id: expect.any(Number) },
            url: FAKE_URL,
        });
    });
    it('sends a batch of requests to a JSON-RPC 2.0 endpoint', () => {
        transport.someMethod(123).someMethod(456).sendBatch();
        expect(makeHttpRequest).toHaveBeenCalledWith({
            headers: CUSTOM_HEADERS,
            payload: [
                { ...createJsonRpcMessage('someMethod', [123]), id: expect.any(Number) },
                { ...createJsonRpcMessage('someMethod', [456]), id: expect.any(Number) },
            ],
            url: FAKE_URL,
        });
    });
    it('returns results from a JSON-RPC 2.0 endpoint', async () => {
        expect.assertions(1);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
        const result = await transport.someMethod().send();
        expect(result).toBe(123);
    });
    it('returns a batch of results from a JSON-RPC 2.0 endpoint', async () => {
        expect.assertions(2);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce([{ result: 123 }, { result: 456 }]);
        const [resultA, resultB] = await transport.someMethod().someMethod().sendBatch();
        expect(resultA).toBe(123);
        expect(resultB).toBe(456);
    });
    it('reorders results of a batch from a JSON-RPC 2.0 endpoint in request order', async () => {
        expect.assertions(3);
        // Produce requests in order.
        const startId = Date.now();
        (getNextMessageId as jest.Mock).mockReturnValueOnce(startId);
        (getNextMessageId as jest.Mock).mockReturnValueOnce(startId + 1);
        (getNextMessageId as jest.Mock).mockReturnValueOnce(startId + 2);
        // Mock the responses being returned out of order.
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce([
            { id: startId + 2, result: 789 },
            { id: startId, result: 123 },
            { id: startId + 1, result: 456 },
        ]);
        const [resultA, resultB, resultC] = await transport.someMethod().someMethod().someMethod().sendBatch();
        expect(resultA).toBe(123);
        expect(resultB).toBe(456);
        expect(resultC).toBe(789);
    });
    it('throws errors from a JSON-RPC 2.0 endpoint', async () => {
        expect.assertions(3);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ error: { code: 123, data: 'abc', message: 'o no' } });
        const sendPromise = transport.someMethod().send();
        await expect(sendPromise).rejects.toThrow(SolanaJsonRpcError);
        await expect(sendPromise).rejects.toThrow(/o no/);
        await expect(sendPromise).rejects.toMatchObject({ code: 123, data: 'abc' });
    });
    it('throws the first error of a batch from a JSON-RPC 2.0 endpoint', async () => {
        expect.assertions(3);
        // Produce requests in order.
        const startId = Date.now();
        (getNextMessageId as jest.Mock).mockReturnValueOnce(startId);
        (getNextMessageId as jest.Mock).mockReturnValueOnce(startId + 1);
        (getNextMessageId as jest.Mock).mockReturnValueOnce(startId + 2);
        // Mock the responses being returned out of order.
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce([
            { error: { code: 456, data: 'def', message: 'also bad' }, id: startId + 2 },
            { error: { code: 123, data: 'abc', message: 'o no' }, id: startId },
            { id: startId + 1, result: 123 },
        ]);
        const sendBatchPromise = transport.someMethod().someMethod().someMethod().sendBatch();
        await expect(sendBatchPromise).rejects.toThrow(SolanaJsonRpcError);
        await expect(sendBatchPromise).rejects.toThrow(/o no/);
        await expect(sendBatchPromise).rejects.toMatchObject({ code: 123, data: 'abc' });
    });
    describe('when calling a method having a concrete implementation', () => {
        let transport: Transport<TestRpcMethods>;
        beforeEach(() => {
            transport = createJsonRpcTransport({
                api: {
                    someMethod(...params: unknown[]): TransportRequest<unknown> {
                        return {
                            methodName: 'someMethodAugmented',
                            params: [...params, 'augmented', 'params'],
                        };
                    },
                } as IRpcApi<TestRpcMethods>,
                url: FAKE_URL,
            });
        });
        it('converts the returned request to a JSON-RPC 2.0 message and sends it to the endpoint', () => {
            transport.someMethod(123).send();
            expect(makeHttpRequest).toHaveBeenCalledWith({
                payload: {
                    ...createJsonRpcMessage('someMethodAugmented', [123, 'augmented', 'params']),
                    id: expect.any(Number),
                },
                url: FAKE_URL,
            });
        });
    });
    describe('when calling a method whose concrete implementation returns a response processor', () => {
        let responseProcessor: jest.Mock;
        let transport: Transport<TestRpcMethods>;
        beforeEach(() => {
            responseProcessor = jest.fn(response => `${response} processed response`);
            transport = createJsonRpcTransport({
                api: {
                    someMethod(...params: unknown[]): TransportRequest<unknown> {
                        return {
                            methodName: 'someMethod',
                            params,
                            responseProcessor,
                        };
                    },
                } as IRpcApi<TestRpcMethods>,
                url: FAKE_URL,
            });
        });
        it('calls the response processor with the response from the JSON-RPC 2.0 endpoint', async () => {
            expect.assertions(1);
            (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
            await transport.someMethod().send();
            expect(responseProcessor).toHaveBeenCalledWith(123);
        });
        it('returns the processed response', async () => {
            expect.assertions(1);
            (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
            const result = await transport.someMethod().send();
            expect(result).toBe('123 processed response');
        });
    });
    describe('when a forbidden header is supplied in configuration', () => {
        let configureTransportWithForbiddenHeaders: () => void;
        beforeEach(() => {
            configureTransportWithForbiddenHeaders = () => {
                createJsonRpcTransport({
                    api: {} as IRpcApi<TestRpcMethods>,
                    headers: { 'sEc-FeTcH-mOdE': 'no-cors' },
                    url: FAKE_URL,
                });
            };
        });
        it('throws in dev mode', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = true;
            expect(configureTransportWithForbiddenHeaders).toThrow(/This header is forbidden:/);
        });
        it('does not throw in non-dev mode', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = false;
            expect(configureTransportWithForbiddenHeaders).not.toThrow();
        });
    });
});

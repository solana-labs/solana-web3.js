import { makeHttpRequest } from '../../http-request';
import { SolanaJsonRpcError } from '../json-rpc-errors';
import { createJsonRpcMessage } from '../json-rpc-message';
import { getNextMessageId } from '../json-rpc-message-id';
import { createJsonRpcTransport } from '..';
import { Transport } from '../json-rpc-transport-types';

jest.mock('../../http-request');
jest.mock('../json-rpc-message-id');

interface TestRpcApi {
    someMethod(...args: unknown[]): unknown;
    someOtherMethod(...args: unknown[]): unknown;
}

describe('JSON-RPC 2.0 transport', () => {
    let transport: Transport<TestRpcApi>;
    const url = 'fake://url';
    beforeEach(() => {
        transport = createJsonRpcTransport<TestRpcApi>({ url });
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
            payload: { ...createJsonRpcMessage('someMethod', [123]), id: expect.any(Number) },
            url,
        });
    });
    it('sends a batch of requests to a JSON-RPC 2.0 endpoint', () => {
        transport.someMethod(123).someOtherMethod(456).sendBatch();
        expect(makeHttpRequest).toHaveBeenCalledWith({
            payload: [
                { ...createJsonRpcMessage('someMethod', [123]), id: expect.any(Number) },
                { ...createJsonRpcMessage('someOtherMethod', [456]), id: expect.any(Number) },
            ],
            url,
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
        const [resultA, resultB] = await transport.someMethod().someOtherMethod().sendBatch();
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
        const [resultA, resultB, resultC] = await transport.someMethod().someOtherMethod().someMethod().sendBatch();
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
        const sendBatchPromise = transport.someMethod().someOtherMethod().someMethod().sendBatch();
        await expect(sendBatchPromise).rejects.toThrow(SolanaJsonRpcError);
        await expect(sendBatchPromise).rejects.toThrow(/o no/);
        await expect(sendBatchPromise).rejects.toMatchObject({ code: 123, data: 'abc' });
    });
});

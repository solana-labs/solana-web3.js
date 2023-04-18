import { createJsonRpc } from '../json-rpc';
import { SolanaJsonRpcError } from '../json-rpc-errors';
import { createJsonRpcMessage } from '../json-rpc-message';
import { getNextMessageId } from '../json-rpc-message-id';
import { IRpcApi, Rpc, RpcRequest } from '../json-rpc-types';
import { IRpcTransport } from '../transports/transport-types';

jest.mock('../json-rpc-message-id');

interface TestRpcMethods {
    someMethod(...args: unknown[]): unknown;
}

describe('JSON-RPC 2.0', () => {
    let makeHttpRequest: IRpcTransport;
    let rpc: Rpc<TestRpcMethods>;
    beforeEach(() => {
        makeHttpRequest = jest.fn(
            () =>
                new Promise(_ => {
                    /* never resolve */
                })
        );
        rpc = createJsonRpc({
            api: {
                // Note the lack of method implementations in the base case.
            } as IRpcApi<TestRpcMethods>,
            transport: makeHttpRequest,
        });
        let counter = 0;
        (getNextMessageId as jest.Mock).mockImplementation(() => counter++);
    });
    it('sends a request to the transport', () => {
        rpc.someMethod(123).send();
        expect(makeHttpRequest).toHaveBeenCalledWith({
            payload: { ...createJsonRpcMessage('someMethod', [123]), id: expect.any(Number) },
        });
    });
    it('sends a batch of requests to the transport', () => {
        rpc.someMethod(123).someMethod(456).sendBatch();
        expect(makeHttpRequest).toHaveBeenCalledWith({
            payload: [
                { ...createJsonRpcMessage('someMethod', [123]), id: expect.any(Number) },
                { ...createJsonRpcMessage('someMethod', [456]), id: expect.any(Number) },
            ],
        });
    });
    it('returns results from the transport', async () => {
        expect.assertions(1);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
        const result = await rpc.someMethod().send();
        expect(result).toBe(123);
    });
    it('returns a batch of results from the transport', async () => {
        expect.assertions(2);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce([{ result: 123 }, { result: 456 }]);
        const [resultA, resultB] = await rpc.someMethod().someMethod().sendBatch();
        expect(resultA).toBe(123);
        expect(resultB).toBe(456);
    });
    it('reorders results of a batch from the transport in request order', async () => {
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
        const [resultA, resultB, resultC] = await rpc.someMethod().someMethod().someMethod().sendBatch();
        expect(resultA).toBe(123);
        expect(resultB).toBe(456);
        expect(resultC).toBe(789);
    });
    it('throws errors from the transport', async () => {
        expect.assertions(3);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ error: { code: 123, data: 'abc', message: 'o no' } });
        const sendPromise = rpc.someMethod().send();
        await expect(sendPromise).rejects.toThrow(SolanaJsonRpcError);
        await expect(sendPromise).rejects.toThrow(/o no/);
        await expect(sendPromise).rejects.toMatchObject({ code: 123, data: 'abc' });
    });
    it('throws the first error of a batch from the transport', async () => {
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
        const sendBatchPromise = rpc.someMethod().someMethod().someMethod().sendBatch();
        await expect(sendBatchPromise).rejects.toThrow(SolanaJsonRpcError);
        await expect(sendBatchPromise).rejects.toThrow(/o no/);
        await expect(sendBatchPromise).rejects.toMatchObject({ code: 123, data: 'abc' });
    });
    describe('when calling a method having a concrete implementation', () => {
        let rpc: Rpc<TestRpcMethods>;
        beforeEach(() => {
            rpc = createJsonRpc({
                api: {
                    someMethod(...params: unknown[]): RpcRequest<unknown> {
                        return {
                            methodName: 'someMethodAugmented',
                            params: [...params, 'augmented', 'params'],
                        };
                    },
                } as IRpcApi<TestRpcMethods>,
                transport: makeHttpRequest,
            });
        });
        it('converts the returned request to a JSON-RPC 2.0 message and sends it to the transport', () => {
            rpc.someMethod(123).send();
            expect(makeHttpRequest).toHaveBeenCalledWith({
                payload: {
                    ...createJsonRpcMessage('someMethodAugmented', [123, 'augmented', 'params']),
                    id: expect.any(Number),
                },
            });
        });
    });
    describe('when calling a method whose concrete implementation returns a response processor', () => {
        let responseProcessor: jest.Mock;
        let rpc: Rpc<TestRpcMethods>;
        beforeEach(() => {
            responseProcessor = jest.fn(response => `${response} processed response`);
            rpc = createJsonRpc({
                api: {
                    someMethod(...params: unknown[]): RpcRequest<unknown> {
                        return {
                            methodName: 'someMethod',
                            params,
                            responseProcessor,
                        };
                    },
                } as IRpcApi<TestRpcMethods>,
                transport: makeHttpRequest,
            });
        });
        it('calls the response processor with the response from the JSON-RPC 2.0 endpoint', async () => {
            expect.assertions(1);
            (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
            await rpc.someMethod().send();
            expect(responseProcessor).toHaveBeenCalledWith(123);
        });
        it('returns the processed response', async () => {
            expect.assertions(1);
            (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
            const result = await rpc.someMethod().send();
            expect(result).toBe('123 processed response');
        });
    });
});

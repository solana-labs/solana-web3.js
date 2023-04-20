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
    it('returns results from the transport', async () => {
        expect.assertions(1);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
        const result = await rpc.someMethod().send();
        expect(result).toBe(123);
    });
    it('throws errors from the transport', async () => {
        expect.assertions(3);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ error: { code: 123, data: 'abc', message: 'o no' } });
        const sendPromise = rpc.someMethod().send();
        await expect(sendPromise).rejects.toThrow(SolanaJsonRpcError);
        await expect(sendPromise).rejects.toThrow(/o no/);
        await expect(sendPromise).rejects.toMatchObject({ code: 123, data: 'abc' });
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

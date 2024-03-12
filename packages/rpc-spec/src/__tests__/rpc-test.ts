import { SOLANA_ERROR__JSON_RPC__PARSE_ERROR, SolanaError } from '@solana/errors';
import { createRpcMessage } from '@solana/rpc-spec-types';

import { createRpc, Rpc } from '../rpc';
import { RpcApi } from '../rpc-api';
import { RpcRequest } from '../rpc-request';
import { RpcTransport } from '../rpc-transport';

interface TestRpcMethods {
    someMethod(...args: unknown[]): unknown;
}

describe('JSON-RPC 2.0', () => {
    let makeHttpRequest: RpcTransport;
    let rpc: Rpc<TestRpcMethods>;
    beforeEach(() => {
        makeHttpRequest = jest.fn(
            () =>
                new Promise(_ => {
                    /* never resolve */
                }),
        );
        rpc = createRpc({
            api: {
                // Note the lack of method implementations in the base case.
            } as RpcApi<TestRpcMethods>,
            transport: makeHttpRequest,
        });
    });
    it('sends a request to the transport', () => {
        rpc.someMethod(123).send();
        expect(makeHttpRequest).toHaveBeenCalledWith({
            payload: { ...createRpcMessage('someMethod', [123]), id: expect.any(Number) },
        });
    });
    it('returns results from the transport', async () => {
        expect.assertions(1);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
        const result = await rpc.someMethod().send();
        expect(result).toBe(123);
    });
    it('throws errors from the transport', async () => {
        expect.assertions(1);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({
            error: { code: SOLANA_ERROR__JSON_RPC__PARSE_ERROR, message: 'o no' },
        });
        const sendPromise = rpc.someMethod().send();
        await expect(sendPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__JSON_RPC__PARSE_ERROR, { __serverMessage: 'o no' }),
        );
    });
    describe('when calling a method having a concrete implementation', () => {
        let rpc: Rpc<TestRpcMethods>;
        beforeEach(() => {
            rpc = createRpc({
                api: {
                    someMethod(...params: unknown[]): RpcRequest<unknown> {
                        return {
                            methodName: 'someMethodAugmented',
                            params: [...params, 'augmented', 'params'],
                        };
                    },
                } as RpcApi<TestRpcMethods>,
                transport: makeHttpRequest,
            });
        });
        it('converts the returned request to a JSON-RPC 2.0 message and sends it to the transport', () => {
            rpc.someMethod(123).send();
            expect(makeHttpRequest).toHaveBeenCalledWith({
                payload: {
                    ...createRpcMessage('someMethodAugmented', [123, 'augmented', 'params']),
                    id: expect.any(Number),
                },
            });
        });
    });
    describe('when calling a method whose concrete implementation returns a response processor', () => {
        let responseTransformer: jest.Mock;
        let rpc: Rpc<TestRpcMethods>;
        beforeEach(() => {
            responseTransformer = jest.fn(response => `${response} processed response`);
            rpc = createRpc({
                api: {
                    someMethod(...params: unknown[]): RpcRequest<unknown> {
                        return {
                            methodName: 'someMethod',
                            params,
                            responseTransformer,
                        };
                    },
                } as RpcApi<TestRpcMethods>,
                transport: makeHttpRequest,
            });
        });
        it('calls the response transformer with the response from the JSON-RPC 2.0 endpoint', async () => {
            expect.assertions(1);
            (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
            await rpc.someMethod().send();
            expect(responseTransformer).toHaveBeenCalledWith(123, 'someMethod');
        });
        it('returns the processed response', async () => {
            expect.assertions(1);
            (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
            const result = await rpc.someMethod().send();
            expect(result).toBe('123 processed response');
        });
    });
});

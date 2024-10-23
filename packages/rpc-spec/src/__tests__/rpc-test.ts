import { SOLANA_ERROR__RPC__API_PLAN_MISSING_FOR_RPC_METHOD, SolanaError } from '@solana/errors';
import { createRpcMessage } from '@solana/rpc-spec-types';

import { createRpc, Rpc } from '../rpc';
import { RpcApi, RpcPlan } from '../rpc-api';
import { RpcTransport } from '../rpc-transport';

interface TestRpcMethods {
    someMethod(...args: unknown[]): unknown;
}

describe('JSON-RPC 2.0', () => {
    let makeHttpRequest: RpcTransport;
    beforeEach(() => {
        makeHttpRequest = jest.fn(
            () =>
                new Promise(_ => {
                    /* never resolve */
                }),
        );
    });
    describe('when no API plan is available for a method', () => {
        let rpc: Rpc<TestRpcMethods>;
        beforeEach(() => {
            rpc = createRpc({
                api: {} as RpcApi<TestRpcMethods>,
                transport: makeHttpRequest,
            });
        });
        it('throws an error', () => {
            expect(() => rpc.someMethod('some', 'params', 123)).toThrow(
                new SolanaError(SOLANA_ERROR__RPC__API_PLAN_MISSING_FOR_RPC_METHOD, {
                    method: 'someMethod',
                    params: ['some', 'params', 123],
                }),
            );
        });
    });
    describe('when using a simple RPC API proxy', () => {
        let rpc: Rpc<TestRpcMethods>;
        beforeEach(() => {
            rpc = createRpc({
                api: new Proxy({} as RpcApi<TestRpcMethods>, {
                    get(_, methodName) {
                        return (...params: unknown[]): RpcPlan<TestRpcMethods> => ({
                            execute: ({ signal, transport }) =>
                                transport({
                                    payload: createRpcMessage({ methodName: methodName.toString(), params }),
                                    signal,
                                }),
                            payload: createRpcMessage({ methodName: methodName.toString(), params }),
                        });
                    },
                }),
                transport: makeHttpRequest,
            });
        });
        it('sends a request to the transport', () => {
            rpc.someMethod(123)
                .send()
                .catch(() => {});
            expect(makeHttpRequest).toHaveBeenCalledWith({
                payload: { ...createRpcMessage({ methodName: 'someMethod', params: [123] }), id: expect.any(Number) },
            });
        });
        it('returns results from the transport', async () => {
            expect.assertions(1);
            (makeHttpRequest as jest.Mock).mockResolvedValueOnce(123);
            const result = await rpc.someMethod().send();
            expect(result).toBe(123);
        });
        it('throws errors from the transport', async () => {
            expect.assertions(1);
            const transportError = new Error('o no');
            (makeHttpRequest as jest.Mock).mockRejectedValueOnce(transportError);
            const sendPromise = rpc.someMethod().send();
            await expect(sendPromise).rejects.toThrow(transportError);
        });
    });
    describe('when calling a method having a concrete implementation', () => {
        let rpc: Rpc<TestRpcMethods>;
        beforeEach(() => {
            rpc = createRpc({
                api: {
                    someMethod(...params: unknown[]): RpcPlan<unknown> {
                        const payload = createRpcMessage({
                            methodName: 'someMethodAugmented',
                            params: [...params, 'augmented', 'params'],
                        });
                        return { execute: ({ signal, transport }) => transport({ payload, signal }), payload };
                    },
                } as RpcApi<TestRpcMethods>,
                transport: makeHttpRequest,
            });
        });
        it('converts the returned request to a JSON-RPC 2.0 message and sends it to the transport', () => {
            rpc.someMethod(123)
                .send()
                .catch(() => {});
            expect(makeHttpRequest).toHaveBeenCalledWith({
                payload: {
                    ...createRpcMessage({ methodName: 'someMethodAugmented', params: [123, 'augmented', 'params'] }),
                    id: expect.any(Number),
                },
            });
        });
    });
    describe('when calling a method whose concrete implementation returns a response processor', () => {
        let responseTransformer: jest.Mock;
        let rpc: Rpc<TestRpcMethods>;
        beforeEach(() => {
            responseTransformer = jest.fn(json => `${json} processed response`);
            rpc = createRpc({
                api: {
                    someMethod(...params: unknown[]): RpcPlan<unknown> {
                        const payload = createRpcMessage({ methodName: 'someMethod', params });
                        return {
                            execute: ({ signal, transport }) => transport({ payload, signal }),
                            payload,
                            responseTransformer,
                        };
                    },
                } as RpcApi<TestRpcMethods>,
                transport: makeHttpRequest,
            });
        });
        it('calls the response transformer with the response from the JSON-RPC 2.0 endpoint', async () => {
            expect.assertions(1);
            const rawResponse = 123;
            (makeHttpRequest as jest.Mock).mockResolvedValueOnce(rawResponse);
            await rpc.someMethod().send();
            expect(responseTransformer).toHaveBeenCalledWith(rawResponse);
        });
        it('returns the processed response', async () => {
            expect.assertions(1);
            (makeHttpRequest as jest.Mock).mockResolvedValueOnce(123);
            const result = await rpc.someMethod().send();
            expect(result).toBe('123 processed response');
        });
    });
});

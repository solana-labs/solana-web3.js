import '@solana/test-matchers/toBeFrozenObject';

import type { RpcRequest } from '@solana/rpc-spec-types';

import { createJsonRpcApi } from '../rpc-api';
import type { RpcTransport } from '../rpc-transport';

type DummyApi = {
    someMethod(...args: unknown[]): unknown;
};

describe('createJsonRpcApi', () => {
    let transport: jest.Mock & RpcTransport;
    beforeEach(() => {
        transport = jest.fn();
    });
    it('returns a plan containing a function to execute the plan', () => {
        // Given a dummy API.
        const api = createJsonRpcApi<DummyApi>();

        // When we call a method on the API.
        const plan = api.someMethod(1, 'two', { three: [4] });

        // Then we expect the plan to contain an `execute` function.
        expect(plan).toHaveProperty('execute');
        expect(typeof plan.execute).toBe('function');
    });
    it('applies the request transformer to the provided method name', async () => {
        expect.assertions(1);

        // Given a dummy API with a request transformer that appends 'Transformed' to the method name.
        const api = createJsonRpcApi<DummyApi>({
            requestTransformer: (request: RpcRequest) => ({
                ...request,
                methodName: `${request.methodName}Transformed`,
            }),
        });

        // When we call a method on the API.
        const plan = api.someMethod();

        // Then we expect the plan executor to pass the transformed method name to the transport.
        await plan.execute({ transport });
        expect(transport).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    method: 'someMethodTransformed',
                }),
            }),
        );
    });
    it('applies the request transformer to the provided params', async () => {
        expect.assertions(1);

        // Given a dummy API with a request transformer that doubles the provided params.
        const api = createJsonRpcApi<DummyApi>({
            requestTransformer: (request: RpcRequest) => ({
                ...request,
                params: (request.params as number[]).map(x => x * 2),
            }),
        });

        // When we call a method on the API.
        const plan = api.someMethod(1, 2, 3);

        // Then we expect the plan executor to pass the transformed params to the transport.
        await plan.execute({ transport });
        expect(transport).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    params: [2, 4, 6],
                }),
            }),
        );
    });
    it("applies the response transformer to the transport's response", async () => {
        expect.assertions(1);

        // Given a dummy API with a response transformer that doubles the response.
        const responseTransformer = (response: unknown) => (response as number) * 2;
        const api = createJsonRpcApi<DummyApi>({ responseTransformer });

        // And given a transport that returns a mock response.
        transport.mockResolvedValue(42);

        // When we call a method on the API.
        const plan = api.someMethod(1, 2, 3);

        // Then we expect the plan to use the response transformer.
        const response = await plan.execute({ transport });
        expect(response).toBe(84);
    });
    it('returns a frozen object', () => {
        // Given a dummy API.
        const api = createJsonRpcApi<DummyApi>();

        // When we call a method on the API.
        const plan = api.someMethod();

        // Then we expect the returned plan to be frozen.
        expect(plan).toBeFrozenObject();
    });
    it('also returns a frozen object with a request transformer', () => {
        // Given a dummy API with a request transformer.
        const api = createJsonRpcApi<DummyApi>({
            requestTransformer: (request: RpcRequest) => ({ ...request, methodName: 'transformed' }),
        });

        // When we call a method on the API.
        const plan = api.someMethod();

        // Then we expect the returned plan to be frozen.
        expect(plan).toBeFrozenObject();
    });
});

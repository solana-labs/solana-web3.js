import '@solana/test-matchers/toBeFrozenObject';

import { createRpcApi } from '../rpc-api';
import { RpcRequest, RpcResponse } from '../rpc-shared';

type DummyApi = {
    someMethod(...args: unknown[]): unknown;
};

describe('createRpcApi', () => {
    it('returns a plan containing the method name and parameters provided', () => {
        // Given a dummy API.
        const api = createRpcApi<DummyApi>();

        // When we call a method on the API.
        const plan = api.someMethod(1, 'two', { three: [4] });

        // Then we expect the plan to contain the method name and the provided parameters.
        expect(plan).toEqual({
            methodName: 'someMethod',
            params: [1, 'two', { three: [4] }],
        });
    });
    it('applies the request transformer to the provided method name', () => {
        // Given a dummy API with a request transformer that appends 'Transformed' to the method name.
        const api = createRpcApi<DummyApi>({
            requestTransformer: (request: RpcRequest) => ({
                ...request,
                methodName: `${request.methodName}Transformed`,
            }),
        });

        // When we call a method on the API.
        const plan = api.someMethod();

        // Then we expect the plan to contain the transformed method name.
        expect(plan.methodName).toBe('someMethodTransformed');
    });
    it('applies the request transformer to the provided params', () => {
        // Given a dummy API with a request transformer that doubles the provided params.
        const api = createRpcApi<DummyApi>({
            requestTransformer: (request: RpcRequest) => ({
                ...request,
                params: (request.params as number[]).map(x => x * 2),
            }),
        });

        // When we call a method on the API.
        const plan = api.someMethod(1, 2, 3);

        // Then we expect the plan to contain the transformed params.
        expect(plan.params).toEqual([2, 4, 6]);
    });
    it('includes the provided response transformer in the plan', () => {
        // Given a dummy API with a response transformer.
        const responseTransformer = <T>(response: RpcResponse) => response as RpcResponse<T>;
        const api = createRpcApi<DummyApi>({ responseTransformer });

        // When we call a method on the API.
        const plan = api.someMethod(1, 2, 3);

        // Then we expect the plan to contain the response transformer.
        expect(plan.responseTransformer).toBe(responseTransformer);
    });
    it('returns a frozen object', () => {
        // Given a dummy API.
        const api = createRpcApi<DummyApi>();

        // When we call a method on the API.
        const plan = api.someMethod();

        // Then we expect the returned plan to be frozen.
        expect(plan).toBeFrozenObject();
    });
    it('also returns a frozen object with a request transformer', () => {
        // Given a dummy API with a request transformer.
        const api = createRpcApi<DummyApi>({
            requestTransformer: (request: RpcRequest) => ({ ...request, methodName: 'transformed' }),
        });

        // When we call a method on the API.
        const plan = api.someMethod();

        // Then we expect the returned plan to be frozen.
        expect(plan).toBeFrozenObject();
    });
});

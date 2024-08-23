import '@solana/test-matchers/toBeFrozenObject';

import { createJsonRpcResponseTransformer, RpcRequest, RpcResponse } from '../rpc-shared';

describe('createJsonRpcResponseTransformer', () => {
    it('can alter the value of the json Promise', async () => {
        expect.assertions(1);

        // Given a request and a response that returns a number.
        const request = { methodName: 'someMethod', params: [123] };
        const response = {
            json: () => Promise.resolve(123),
            text: () => Promise.resolve('123'),
        };

        // When we create a JSON transformer that doubles the number.
        const transformer = createJsonRpcResponseTransformer((json: unknown) => (json as number) * 2);

        // Then the transformed response should return the doubled number.
        const transformedResponse = transformer(response, request);
        transformedResponse satisfies RpcResponse<number>;
        await expect(transformedResponse.json()).resolves.toBe(246);
    });

    it('does not alter the value of the text Promise', async () => {
        expect.assertions(1);

        // Given a request and a response that returns a number.
        const request = { methodName: 'someMethod', params: [123] };
        const response = {
            json: () => Promise.resolve(123),
            text: () => Promise.resolve('123'),
        };

        // When we create a JSON transformer that doubles the number.
        const transformer = createJsonRpcResponseTransformer((json: unknown) => (json as number) * 2);

        // Then the text should function should return the original string.
        const transformedResponse = transformer(response, request);
        await expect(transformedResponse.text()).resolves.toBe('123');
    });

    it('returns a frozen object as the Reponse', () => {
        // Given any response.
        const response = {
            json: () => Promise.resolve(123),
            text: () => Promise.resolve('123'),
        };

        // When we pass it through a JSON transformer.
        const transformedResponse = createJsonRpcResponseTransformer(x => x)(response, {} as RpcRequest);

        // Then we expect the transformed response to be frozen.
        expect(transformedResponse).toBeFrozenObject();
    });
});

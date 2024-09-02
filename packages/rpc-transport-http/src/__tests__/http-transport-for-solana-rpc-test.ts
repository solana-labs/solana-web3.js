import { RpcTransport } from '@solana/rpc-spec';

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
const MAX_SAFE_INTEGER_PLUS_ONE = BigInt(Number.MAX_SAFE_INTEGER) + 1n;

describe('createHttpTransportForSolanaRpc', () => {
    let fetchSpy: jest.SpyInstance;
    let makeHttpRequest: RpcTransport;
    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            fetchSpy = jest.spyOn(globalThis, 'fetch');
            const { createHttpTransportForSolanaRpc } =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await import('../http-transport-for-solana-rpc');
            makeHttpRequest = createHttpTransportForSolanaRpc({ url: 'http://localhost' });
        });
    });
    describe('when the request is from the Solana RPC API', () => {
        it('passes all bigints as large numerical values in the request body', async () => {
            expect.assertions(1);
            fetchSpy.mockResolvedValue({ ok: true, text: () => `{"ok":true}` });
            await makeHttpRequest({
                payload: {
                    jsonrpc: '2.0',
                    method: 'getBalance',
                    params: {
                        numbersInString: 'He said: "1, 2, 3, Soleil!"',
                        safeNumber: MAX_SAFE_INTEGER,
                        unsafeNumber: MAX_SAFE_INTEGER_PLUS_ONE,
                    },
                },
            });
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    body: expect.stringContaining(
                        `"params":{` +
                            `"numbersInString":"He said: \\"1, 2, 3, Soleil!\\"",` +
                            `"safeNumber":${MAX_SAFE_INTEGER},` +
                            `"unsafeNumber":${MAX_SAFE_INTEGER_PLUS_ONE}}`,
                    ),
                }),
            );
        });
        it('gets all integers as bigints within the response', async () => {
            expect.assertions(1);
            fetchSpy.mockResolvedValue({
                ok: true,
                text: () =>
                    `{"safeNumber": ${MAX_SAFE_INTEGER}, ` +
                    `"unsafeNumber": ${MAX_SAFE_INTEGER_PLUS_ONE}, ` +
                    `"numbersInString": "He said: \\"1, 2, 3, Soleil!\\""}`,
            });
            const requestPromise = makeHttpRequest({
                payload: {
                    jsonrpc: '2.0',
                    method: 'getBalance',
                    params: ['1234..5678'],
                },
            });
            await expect(requestPromise).resolves.toStrictEqual({
                numbersInString: 'He said: "1, 2, 3, Soleil!"',
                safeNumber: MAX_SAFE_INTEGER,
                unsafeNumber: MAX_SAFE_INTEGER_PLUS_ONE,
            });
        });
    });
    describe('when the request is not from the Solana RPC API', () => {
        it('fails to stringify bigints in requests', async () => {
            expect.assertions(1);
            const promise = makeHttpRequest({
                payload: {
                    jsonrpc: '2.0',
                    method: 'getAssetsByOwner',
                    params: [MAX_SAFE_INTEGER_PLUS_ONE],
                },
            });
            await expect(promise).rejects.toThrow(new TypeError('Do not know how to serialize a BigInt'));
        });
        it('downcasts bigints to numbers in responses', async () => {
            expect.assertions(1);
            fetchSpy.mockResolvedValue({
                ok: true,
                text: () =>
                    `{"safeNumber": ${MAX_SAFE_INTEGER}, ` +
                    `"unsafeNumber": ${MAX_SAFE_INTEGER_PLUS_ONE}, ` +
                    `"numbersInString": "He said: \\"1, 2, 3, Soleil!\\""}`,
            });
            const requestPromise = makeHttpRequest({
                payload: {
                    jsonrpc: '2.0',
                    method: 'getAssetsByOwner',
                    params: ['1234..5678'],
                },
            });
            await expect(requestPromise).resolves.toStrictEqual({
                numbersInString: 'He said: "1, 2, 3, Soleil!"',
                safeNumber: Number(MAX_SAFE_INTEGER),
                unsafeNumber: Number(MAX_SAFE_INTEGER_PLUS_ONE),
            });
        });
    });
});

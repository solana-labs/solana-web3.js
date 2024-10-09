import { RpcTransport } from '@solana/rpc-spec';

describe('createHttpTransport and `toJson` function', () => {
    let toJson: jest.Mock;
    let fetchSpy: jest.SpyInstance;
    let makeHttpRequest: RpcTransport;
    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            toJson = jest.fn(value => JSON.stringify(value));
            fetchSpy = jest.spyOn(globalThis, 'fetch');
            fetchSpy.mockResolvedValue({ json: () => ({ ok: true }), ok: true });
            const { createHttpTransport } =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await import('../http-transport');
            makeHttpRequest = createHttpTransport({ toJson, url: 'http://localhost' });
        });
    });
    it('uses the `toJson` function to transform the payload to a JSON string', () => {
        makeHttpRequest({ payload: { foo: 123 } }).catch(() => {});
        expect(toJson).toHaveBeenCalledWith({ foo: 123 });
    });
    it('uses passes the JSON string to the fetch API', () => {
        toJson.mockReturnValueOnce('{"someAugmented":"jsonString"}');
        makeHttpRequest({ payload: { foo: 123 } }).catch(() => {});
        expect(fetchSpy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                body: '{"someAugmented":"jsonString"}',
            }),
        );
    });
});

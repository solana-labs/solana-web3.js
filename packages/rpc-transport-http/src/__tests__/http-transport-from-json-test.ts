import { RpcTransport } from '@solana/rpc-spec';

describe('createHttpTransport and `fromJson` function', () => {
    let fromJson: jest.Mock;
    let fetchSpy: jest.SpyInstance;
    let makeHttpRequest: RpcTransport;
    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            fromJson = jest.fn();
            fetchSpy = jest.spyOn(globalThis, 'fetch');
            fetchSpy.mockResolvedValue({ ok: true, text: () => '{"ok":true}' });
            const { createHttpTransport } =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await import('../http-transport');
            makeHttpRequest = createHttpTransport({ fromJson, url: 'http://localhost' });
        });
    });
    it('uses the `fromJson` function to parse the response from a JSON string', async () => {
        expect.assertions(1);
        await makeHttpRequest({ payload: { foo: 123 } });
        expect(fromJson).toHaveBeenCalledWith('{"ok":true}', { foo: 123 });
    });
    it('returns the value parsed by `fromJson`', async () => {
        expect.assertions(1);
        fromJson.mockReturnValueOnce({ result: 456 });
        await expect(makeHttpRequest({ payload: { foo: 123 } })).resolves.toEqual({ result: 456 });
    });
});

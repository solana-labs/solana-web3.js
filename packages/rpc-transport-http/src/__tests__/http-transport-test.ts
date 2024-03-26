import { SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR, SolanaError } from '@solana/errors';
import { RpcTransport } from '@solana/rpc-spec';

// HACK: Pierce the veil of `jest.isolateModules` so that the modules inside get the same version of
//       `@solana/errors` that is imported above.
jest.mock('@solana/errors', () => jest.requireActual('@solana/errors'));

describe('createHttpTransport', () => {
    let fetchSpy: jest.SpyInstance;
    let makeHttpRequest: RpcTransport;
    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            fetchSpy = jest.spyOn(globalThis, 'fetch');
            const { createHttpTransport } =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await import('../http-transport');
            makeHttpRequest = createHttpTransport({ url: 'http://localhost' });
        });
    });
    describe('when the endpoint returns a non-200 status code', () => {
        beforeEach(() => {
            fetchSpy.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'We looked everywhere',
            });
        });
        it('throws HTTP errors', async () => {
            expect.assertions(1);
            const requestPromise = makeHttpRequest({ payload: 123 });
            await expect(requestPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR, {
                    message: 'We looked everywhere',
                    statusCode: 404,
                }),
            );
        });
    });
    describe('when the transport fatals', () => {
        beforeEach(() => {
            fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));
        });
        it('passes the exception through', async () => {
            expect.assertions(1);
            await expect(makeHttpRequest({ payload: 123 })).rejects.toThrow(new TypeError('Failed to fetch'));
        });
    });
    describe('when the endpoint returns a well-formed JSON response', () => {
        beforeEach(() => {
            fetchSpy.mockResolvedValue({
                json: () => ({ ok: true }),
                ok: true,
            });
        });
        it('calls fetch with the specified URL', () => {
            makeHttpRequest({ payload: 123 });
            expect(fetchSpy).toHaveBeenCalledWith('http://localhost', expect.anything());
        });
        it('sets the `body` to a stringfied version of the payload', () => {
            makeHttpRequest({ payload: { ok: true } });
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    body: JSON.stringify({ ok: true }),
                }),
            );
        });
        it('sets the accept header to `application/json`', () => {
            makeHttpRequest({ payload: 123 });
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        accept: 'application/json',
                    }),
                }),
            );
        });
        it('sets the content type header to `application/json; charset=utf-8`', () => {
            makeHttpRequest({ payload: 123 });
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'content-type': 'application/json; charset=utf-8',
                    }),
                }),
            );
        });
        it('sets the content length header to the length of the JSON-stringified payload', () => {
            makeHttpRequest({
                payload:
                    // Shruggie: https://emojipedia.org/person-shrugging/
                    '\xAF\\\x5F\x28\u30C4\x29\x5F\x2F\xAF' +
                    ' ' +
                    // https://emojipedia.org/waving-hand-medium-skin-tone/
                    '\u{1F44B}\u{1F3FD}' +
                    ' ' +
                    // https://tinyurl.com/bdemuf3r
                    '\u{1F469}\u{1F3FB}\u200D\u2764\uFE0F\u200D\u{1F469}\u{1F3FF}',
            });
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'content-length': '30',
                    }),
                }),
            );
        });
        it('sets the `method` to `POST`', () => {
            makeHttpRequest({ payload: 123 });
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    method: 'POST',
                }),
            );
        });
    });
});

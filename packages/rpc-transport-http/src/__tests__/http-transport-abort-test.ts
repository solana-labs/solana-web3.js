import { RpcTransport } from '@solana/rpc-spec';

import { createHttpTransport } from '../http-transport';

describe('createHttpTransport and `AbortSignal`', () => {
    let makeHttpRequest: RpcTransport;
    beforeEach(() => {
        makeHttpRequest = createHttpTransport({ url: 'http://localhost' });
    });
    describe('when invoked with an already-aborted `AbortSignal`', () => {
        it('rejects with an `AbortError` when no reason is specified', async () => {
            expect.assertions(3);
            const sendPromise = makeHttpRequest({ payload: 123, signal: AbortSignal.abort() });
            await expect(sendPromise).rejects.toThrow();
            await expect(sendPromise).rejects.toBeInstanceOf(DOMException);
            await expect(sendPromise).rejects.toHaveProperty('name', 'AbortError');
        });
        // FIXME: https://github.com/JakeChampion/fetch/pull/1436
        // `whatwg-fetch` handles `reason` incorrectly; it unconditionally throws `AbortError`
        if (!__BROWSER__) {
            it("rejects with the `AbortSignal's` reason", async () => {
                expect.assertions(1);
                const sendPromise = makeHttpRequest({
                    payload: 123,
                    signal: AbortSignal.abort('Already aborted'),
                });
                await expect(sendPromise).rejects.toBe('Already aborted');
            });
        }
    });
    describe('when it receives an abort signal mid-request', () => {
        let abortController: AbortController;
        let abortSignal: AbortSignal;
        beforeEach(() => {
            abortController = new AbortController();
            abortSignal = abortController.signal;
        });
        it('rejects with an `AbortError` when no reason is specified', async () => {
            expect.assertions(1);
            const sendPromise = makeHttpRequest({ payload: 123, signal: abortSignal });
            abortController.abort();
            await expect(sendPromise).rejects.toThrow();
        });
        // FIXME: https://github.com/JakeChampion/fetch/pull/1436
        // `whatwg-fetch` handles `reason` incorrectly; it unconditionally throws `AbortError`
        if (!__BROWSER__) {
            it("rejects with with the `AbortSignal's` reason", async () => {
                expect.assertions(1);
                const sendPromise = makeHttpRequest({ payload: 123, signal: abortSignal });
                abortController.abort('I got bored waiting');
                await expect(sendPromise).rejects.toBe('I got bored waiting');
            });
        }
    });
    describe('when it receives an abort signal after responding', () => {
        let abortController: AbortController;
        let abortSignal: AbortSignal;
        let fetchSpy: jest.SpyInstance;
        beforeEach(async () => {
            fetchSpy = jest.spyOn(globalThis, 'fetch');
            await jest.isolateModulesAsync(async () => {
                const { createHttpTransport } =
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    await import('../http-transport');
                makeHttpRequest = createHttpTransport({ url: 'http://localhost' });
            });
            abortController = new AbortController();
            abortSignal = abortController.signal;
        });
        it('resolves with the response', async () => {
            expect.assertions(1);
            jest.mocked(fetchSpy).mockResolvedValueOnce({
                json: () => ({ ok: true }),
                ok: true,
            } as unknown as Response);
            const sendPromise = makeHttpRequest({ payload: 123, signal: abortSignal });
            abortController.abort('I got bored waiting');
            await expect(sendPromise).resolves.toMatchObject({
                ok: true,
            });
        });
    });
});

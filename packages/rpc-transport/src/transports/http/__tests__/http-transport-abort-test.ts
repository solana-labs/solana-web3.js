import fetchMock from 'jest-fetch-mock-fork';

import { IRpcTransport } from '../../transport-types';
import { createHttpTransport } from '../http-transport';

describe('createHttpTransport and `AbortSignal`', () => {
    let makeHttpRequest: IRpcTransport;
    beforeEach(() => {
        fetchMock.once(JSON.stringify({ ok: true }));
        makeHttpRequest = createHttpTransport({ url: 'fake://url' });
    });
    describe('when invoked with an already-aborted `AbortSignal`', () => {
        let abortSignal: AbortSignal;
        beforeEach(() => {
            const abortController = new AbortController();
            abortController.abort('I got bored waiting');
            abortSignal = abortController.signal;
        });
        it('rejects with an `AbortError`', async () => {
            expect.assertions(1);
            await expect(() => makeHttpRequest({ payload: 123, signal: abortSignal })).rejects.toThrow();
        });
    });
    describe('when it receives an abort signal mid-request', () => {
        let abortController: AbortController;
        let abortSignal: AbortSignal;
        beforeEach(() => {
            fetchMock.resetMocks();
            fetchMock.dontMock();
            abortController = new AbortController();
            abortSignal = abortController.signal;
        });
        it('rejects with an `AbortError`', async () => {
            expect.assertions(1);
            const sendPromise = makeHttpRequest({ payload: 123, signal: abortSignal });
            abortController.abort('I got bored waiting');
            await expect(sendPromise).rejects.toThrow();
        });
    });
    describe('when it receives an abort signal after responding', () => {
        let abortController: AbortController;
        let abortSignal: AbortSignal;
        beforeEach(() => {
            fetchMock.once(JSON.stringify({ ok: true }));
            abortController = new AbortController();
            abortSignal = abortController.signal;
        });
        it('resolves with the response', async () => {
            expect.assertions(1);
            const sendPromise = makeHttpRequest({ payload: 123, signal: abortSignal });
            abortController.abort('I got bored waiting');
            await expect(sendPromise).resolves.toMatchObject({
                ok: true,
            });
        });
    });
});

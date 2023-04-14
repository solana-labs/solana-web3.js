import { makeHttpRequest } from '../http-request';
import { SolanaHttpError } from '../http-request-errors';

import fetchMock from 'jest-fetch-mock-fork';

describe('makeHttpRequest', () => {
    describe('when the endpoint returns a non-200 status code', () => {
        beforeEach(() => {
            fetchMock.once('', { status: 404, statusText: 'We looked everywhere' });
        });
        it('throws HTTP errors', async () => {
            expect.assertions(3);
            const requestPromise = makeHttpRequest({ payload: 123, url: 'fake://url' });
            await expect(requestPromise).rejects.toThrow(SolanaHttpError);
            await expect(requestPromise).rejects.toThrow(/We looked everywhere/);
            await expect(requestPromise).rejects.toMatchObject({ statusCode: 404 });
        });
    });
    describe('when the transport fatals', () => {
        beforeEach(() => {
            fetchMock.mockReject(new TypeError('Failed to fetch'));
        });
        it('passes the exception through', async () => {
            expect.assertions(1);
            await expect(makeHttpRequest({ payload: 123, url: 'fake://url' })).rejects.toThrow(
                new TypeError('Failed to fetch')
            );
        });
    });
    describe('when the endpoint returns a well-formed JSON response', () => {
        beforeEach(() => {
            fetchMock.once(JSON.stringify({ ok: true }));
        });
        it('calls fetch with the specified URL', () => {
            makeHttpRequest({ payload: 123, url: 'fake://url' });
            expect(fetchMock).toHaveBeenCalledWith('fake://url', expect.anything());
        });
        it('sets the `body` to a stringfied version of the payload', () => {
            makeHttpRequest({ payload: { ok: true }, url: 'fake://url' });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    body: JSON.stringify({ ok: true }),
                })
            );
        });
        it('sets the accept header to `application/json`', () => {
            makeHttpRequest({ payload: 123, url: 'fake://url' });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Accept: 'application/json',
                    }),
                })
            );
        });
        it('sets the content type header to `application/json; charset=utf-8`', () => {
            makeHttpRequest({ payload: 123, url: 'fake://url' });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json; charset=utf-8',
                    }),
                })
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
                url: 'fake://url',
            });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Length': '30',
                    }),
                })
            );
        });
        it('sets the `method` to `POST`', () => {
            makeHttpRequest({ payload: 123, url: 'fake://url' });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });
    });
    describe('when invoked with an already-aborted `AbortSignal`', () => {
        let abortSignal: AbortSignal;
        beforeEach(() => {
            fetchMock.once(JSON.stringify({ ok: true }));
            const abortController = new AbortController();
            abortController.abort('I got bored waiting');
            abortSignal = abortController.signal;
        });
        it('rejects with an `AbortError`', async () => {
            expect.assertions(1);
            await expect(() => makeHttpRequest({ abortSignal, payload: 123, url: 'fake://url' })).rejects.toThrow();
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
            const sendPromise = makeHttpRequest({ abortSignal, payload: 123, url: 'fake://url' });
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
            const sendPromise = makeHttpRequest({ abortSignal, payload: 123, url: 'fake://url' });
            abortController.abort('I got bored waiting');
            await expect(sendPromise).resolves.toMatchObject({
                ok: true,
            });
        });
    });
});

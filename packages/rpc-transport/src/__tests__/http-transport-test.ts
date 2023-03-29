import { makeHttpRequest } from '../http-request';
import { SolanaHttpError } from '../http-request-errors';

import fetchMock from 'jest-fetch-mock';

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
        it('sets the content type header to `application/json`', () => {
            makeHttpRequest({ payload: 123, url: 'fake://url' });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-type': 'application/json',
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
});

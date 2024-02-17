import { getTimeoutPromise } from '../confirmation-strategy-timeout';

describe('getTimeoutPromise', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    it.each`
        commitment     | defaultTimeoutMs
        ${'processed'} | ${30_000}
        ${'confirmed'} | ${60_000}
        ${'finalized'} | ${60_000}
    `('pends for $defaultTimeoutMs when the commitment is `$commitment`', async ({ commitment, defaultTimeoutMs }) => {
        expect.assertions(2);
        const timeoutPromise = getTimeoutPromise({
            abortSignal: new AbortController().signal,
            commitment,
        });
        await jest.advanceTimersByTimeAsync(defaultTimeoutMs - 1);
        await expect(Promise.race([timeoutPromise, 'pending'])).resolves.toBe('pending');
        await jest.advanceTimersByTimeAsync(1);
        await expect(Promise.race([timeoutPromise, 'pending'])).rejects.toThrow();
    });
    it('throws an abort error when aborted before the timeout', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        const timeoutPromise = getTimeoutPromise({
            abortSignal: abortController.signal,
            commitment: 'finalized',
        });
        abortController.abort();
        await expect(timeoutPromise).rejects.toThrow(/operation was aborted/);
    });
});

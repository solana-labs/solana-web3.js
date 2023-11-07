import { Signature } from '@solana/keys';

import { waitForRecentTransactionConfirmationUntilTimeout } from '../airdrop-confirmer';

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

describe('waitForRecentTransactionConfirmationUntilTimeout', () => {
    const MOCK_SIGNATURE = '4'.repeat(44) as Signature;
    let getTimeoutPromise: jest.Mock<Promise<void>>;
    let getRecentSignatureConfirmationPromise: jest.Mock<Promise<void>>;
    beforeEach(() => {
        getTimeoutPromise = jest.fn().mockReturnValue(FOREVER_PROMISE);
        getRecentSignatureConfirmationPromise = jest.fn().mockReturnValue(FOREVER_PROMISE);
    });
    it('throws when the signal is already aborted', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        abortController.abort();
        const commitmentPromise = waitForRecentTransactionConfirmationUntilTimeout({
            abortSignal: abortController.signal,
            commitment: 'finalized',
            getRecentSignatureConfirmationPromise,
            getTimeoutPromise,
            signature: MOCK_SIGNATURE,
        });
        await expect(commitmentPromise).rejects.toThrow('aborted');
    });
    it('calls `getTimeoutPromise` with the necessary input', async () => {
        expect.assertions(1);
        waitForRecentTransactionConfirmationUntilTimeout({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            getRecentSignatureConfirmationPromise,
            getTimeoutPromise,
            signature: MOCK_SIGNATURE,
        });
        expect(getTimeoutPromise).toHaveBeenCalledWith({
            abortSignal: expect.any(AbortSignal),
            commitment: 'finalized',
        });
    });
    it('calls `getRecentSignatureConfirmationPromise` with the necessary input', async () => {
        expect.assertions(1);
        waitForRecentTransactionConfirmationUntilTimeout({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            getRecentSignatureConfirmationPromise,
            getTimeoutPromise,
            signature: MOCK_SIGNATURE,
        });
        expect(getRecentSignatureConfirmationPromise).toHaveBeenCalledWith({
            abortSignal: expect.any(AbortSignal),
            commitment: 'finalized',
            signature: '4'.repeat(44),
        });
    });
    it('resolves when the signature confirmation promise resolves despite the timeout promise having thrown', async () => {
        expect.assertions(1);
        getTimeoutPromise.mockRejectedValue(new Error('o no'));
        getRecentSignatureConfirmationPromise.mockResolvedValue(undefined);
        const commitmentPromise = waitForRecentTransactionConfirmationUntilTimeout({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            getRecentSignatureConfirmationPromise,
            getTimeoutPromise,
            signature: MOCK_SIGNATURE,
        });
        await expect(commitmentPromise).resolves.toBeUndefined();
    });
    it('throws when the timeout promise throws', async () => {
        expect.assertions(1);
        getTimeoutPromise.mockRejectedValue(new Error('o no'));
        const commitmentPromise = waitForRecentTransactionConfirmationUntilTimeout({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            getRecentSignatureConfirmationPromise,
            getTimeoutPromise,
            signature: MOCK_SIGNATURE,
        });
        await expect(commitmentPromise).rejects.toThrow('o no');
    });
    it('throws when the signature confirmation promise throws', async () => {
        expect.assertions(1);
        getRecentSignatureConfirmationPromise.mockRejectedValue(new Error('o no'));
        const commitmentPromise = waitForRecentTransactionConfirmationUntilTimeout({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            getRecentSignatureConfirmationPromise,
            getTimeoutPromise,
            signature: MOCK_SIGNATURE,
        });
        await expect(commitmentPromise).rejects.toThrow('o no');
    });
    it('calls the abort signal passed to `getTimeoutPromise` when aborted', async () => {
        expect.assertions(1);
        const handleAbortOnTimeoutPromise = jest.fn();
        getTimeoutPromise.mockImplementation(async ({ abortSignal }) => {
            abortSignal.addEventListener('abort', handleAbortOnTimeoutPromise);
            await FOREVER_PROMISE;
        });
        const abortController = new AbortController();
        waitForRecentTransactionConfirmationUntilTimeout({
            abortSignal: abortController.signal,
            commitment: 'finalized',
            getRecentSignatureConfirmationPromise,
            getTimeoutPromise,
            signature: MOCK_SIGNATURE,
        });
        abortController.abort();
        expect(handleAbortOnTimeoutPromise).toHaveBeenCalled();
    });
    it('calls the abort signal passed to `getRecentSignatureConfirmationPromise` when aborted', async () => {
        expect.assertions(1);
        const handleAbortOnSignatureConfirmationPromise = jest.fn();
        getRecentSignatureConfirmationPromise.mockImplementation(async ({ abortSignal }) => {
            abortSignal.addEventListener('abort', handleAbortOnSignatureConfirmationPromise);
            await FOREVER_PROMISE;
        });
        const abortController = new AbortController();
        waitForRecentTransactionConfirmationUntilTimeout({
            abortSignal: abortController.signal,
            commitment: 'finalized',
            getRecentSignatureConfirmationPromise,
            getTimeoutPromise,
            signature: MOCK_SIGNATURE,
        });
        abortController.abort();
        expect(handleAbortOnSignatureConfirmationPromise).toHaveBeenCalled();
    });
});

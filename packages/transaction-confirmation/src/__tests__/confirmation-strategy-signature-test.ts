import { SOLANA_ERROR__TRANSACTION_ERROR__UNKNOWN, SolanaError } from '@solana/errors';
import { Signature } from '@solana/keys';

import { createRecentSignatureConfirmationPromiseFactory } from '../confirmation-strategy-recent-signature';

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

describe('createSignatureConfirmationPromiseFactory', () => {
    let signatureNotificationGenerator: jest.Mock;
    let createPendingSubscription: jest.Mock;
    let createSubscriptionIterable: jest.Mock;
    let getSignatureStatusesMock: jest.Mock;
    let getSignatureConfirmationPromise: ReturnType<typeof createRecentSignatureConfirmationPromiseFactory>;
    beforeEach(() => {
        jest.useFakeTimers();
        signatureNotificationGenerator = jest.fn().mockImplementation(async function* () {
            yield await FOREVER_PROMISE;
        });
        getSignatureStatusesMock = jest.fn().mockReturnValue(FOREVER_PROMISE);
        const rpc = {
            getSignatureStatuses: () => ({
                send: getSignatureStatusesMock,
            }),
        };
        createSubscriptionIterable = jest.fn().mockResolvedValue({
            [Symbol.asyncIterator]: signatureNotificationGenerator,
        });
        createPendingSubscription = jest.fn().mockReturnValue({ subscribe: createSubscriptionIterable });
        const rpcSubscriptions = {
            signatureNotifications: createPendingSubscription,
        };
        getSignatureConfirmationPromise = createRecentSignatureConfirmationPromiseFactory(rpc, rpcSubscriptions);
    });
    it('sets up a subscription for notifications about signature changes', async () => {
        expect.assertions(2);
        getSignatureConfirmationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            signature: 'abc' as Signature,
        });
        await jest.runAllTimersAsync();
        expect(createPendingSubscription).toHaveBeenCalledWith('abc', {
            commitment: 'finalized',
        });
        expect(createSubscriptionIterable).toHaveBeenCalled();
    });
    it('does not fire off the one shot query for the signature status until the subscription is set up', async () => {
        expect.assertions(2);
        let setupSubscription;
        createSubscriptionIterable.mockReturnValue(
            new Promise(resolve => {
                setupSubscription = resolve;
            }),
        );
        getSignatureConfirmationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            signature: 'abc' as Signature,
        });
        await jest.runAllTimersAsync();
        expect(getSignatureStatusesMock).not.toHaveBeenCalled();
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setupSubscription({
            [Symbol.asyncIterator]: signatureNotificationGenerator,
        });
        await jest.runAllTimersAsync();
        expect(getSignatureStatusesMock).toHaveBeenCalled();
    });
    it.each(['processed', 'confirmed'])(
        'continues to pend when the signature status returned by the one-shot query is at a lower level of commitment (eg. `%s`)',
        async achievedCommitment => {
            expect.assertions(1);
            getSignatureStatusesMock.mockResolvedValue({
                value: [{ confirmationStatus: achievedCommitment }],
            });
            const signatureConfirmationPromise = getSignatureConfirmationPromise({
                abortSignal: new AbortController().signal,
                commitment: 'finalized',
                signature: 'abc' as Signature,
            });
            await jest.runAllTimersAsync();
            await expect(Promise.race([signatureConfirmationPromise, 'pending'])).resolves.toBe('pending');
        },
    );
    it('continues to pend when no signature status is returned by the one-shot query', async () => {
        expect.assertions(1);
        getSignatureStatusesMock.mockResolvedValue({
            value: [null],
        });
        const signatureConfirmationPromise = getSignatureConfirmationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            signature: 'abc' as Signature,
        });
        await jest.runAllTimersAsync();
        await expect(Promise.race([signatureConfirmationPromise, 'pending'])).resolves.toBe('pending');
    });
    it('resolves when the signature status returned by the one-shot query is at the target level of commitment', async () => {
        expect.assertions(1);
        getSignatureStatusesMock.mockResolvedValue({
            value: [{ confirmationStatus: 'finalized' }],
        });
        const signatureConfirmationPromise = getSignatureConfirmationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            signature: 'abc' as Signature,
        });
        await expect(signatureConfirmationPromise).resolves.toBeUndefined();
    });
    it('resolves when a signature status notification is returned by the signature subscription', async () => {
        expect.assertions(1);
        signatureNotificationGenerator.mockImplementation(async function* () {
            yield {
                value: { err: null },
            };
            yield FOREVER_PROMISE;
        });
        const signatureConfirmationPromise = getSignatureConfirmationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            signature: 'abc' as Signature,
        });
        await expect(signatureConfirmationPromise).resolves.toBeUndefined();
    });
    it('fatals when the signature subscription returns an error', async () => {
        expect.assertions(1);
        signatureNotificationGenerator.mockImplementation(async function* () {
            yield { value: { err: 'o no' } };
            yield FOREVER_PROMISE;
        });
        const signatureConfirmationPromise = getSignatureConfirmationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            signature: 'abc' as Signature,
        });
        await expect(signatureConfirmationPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION_ERROR__UNKNOWN, { errorName: 'o no' }),
        );
    });
    it('calls the abort signal passed to the signature statuses query when aborted', async () => {
        expect.assertions(2);
        const abortController = new AbortController();
        getSignatureConfirmationPromise({
            abortSignal: abortController.signal,
            commitment: 'finalized',
            signature: 'abc' as Signature,
        });
        await jest.runAllTimersAsync();
        expect(getSignatureStatusesMock).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: false }),
        });
        abortController.abort();
        expect(getSignatureStatusesMock).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: true }),
        });
    });
    it('calls the abort signal passed to the signature subscription when aborted', () => {
        const abortController = new AbortController();
        getSignatureConfirmationPromise({
            abortSignal: abortController.signal,
            commitment: 'finalized',
            signature: 'abc' as Signature,
        });
        expect(createSubscriptionIterable).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: false }),
        });
        abortController.abort();
        expect(createSubscriptionIterable).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: true }),
        });
    });
});

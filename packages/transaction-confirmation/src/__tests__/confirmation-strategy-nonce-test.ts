import { Address } from '@solana/addresses';
import { getBase58Encoder, getBase64Decoder } from '@solana/codecs-strings';
import { SOLANA_ERROR__INVALID_NONCE, SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND, SolanaError } from '@solana/errors';
import { Nonce } from '@solana/transactions';

import { createNonceInvalidationPromiseFactory } from '../confirmation-strategy-nonce';

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

describe('createNonceInvalidationPromiseFactory', () => {
    function getBase64EncodedNonceAccountData(nonceValue: Nonce) {
        // This is mostly fake; we just put the nonce value in the correct spot in the byte buffer
        // without actually implementing the rest.
        const NONCE_VALUE_OFFSET =
            4 + // version(u32)
            4 + // state(u32)
            32; // nonce authority(pubkey)
        const bytes = new Uint8Array(
            NONCE_VALUE_OFFSET + // zeros up to the offset
                32, // nonce value(pubkey)
            // don't care about anything after this
        );
        bytes.set(getBase58Encoder().encode(nonceValue), NONCE_VALUE_OFFSET);
        return [getBase64Decoder().decode(bytes), 'base64'];
    }
    let accountNotificationGenerator: jest.Mock;
    let createPendingSubscription: jest.Mock;
    let createSubscriptionIterable: jest.Mock;
    let getAccountInfoMock: jest.Mock;
    let getNonceInvalidationPromise: ReturnType<typeof createNonceInvalidationPromiseFactory>;
    beforeEach(() => {
        jest.useFakeTimers();
        accountNotificationGenerator = jest.fn().mockImplementation(async function* () {
            yield await FOREVER_PROMISE;
        });
        getAccountInfoMock = jest.fn().mockReturnValue(FOREVER_PROMISE);
        const rpc = {
            getAccountInfo: () => ({
                send: getAccountInfoMock,
            }),
        };
        createSubscriptionIterable = jest.fn().mockResolvedValue({
            [Symbol.asyncIterator]: accountNotificationGenerator,
        });
        createPendingSubscription = jest.fn().mockReturnValue({ subscribe: createSubscriptionIterable });
        const rpcSubscriptions = {
            accountNotifications: createPendingSubscription,
        };
        getNonceInvalidationPromise = createNonceInvalidationPromiseFactory(rpc, rpcSubscriptions);
    });
    it('calls the abort signal passed to the account info query when aborted', async () => {
        expect.assertions(2);
        const abortController = new AbortController();
        getNonceInvalidationPromise({
            abortSignal: abortController.signal,
            commitment: 'finalized',
            currentNonceValue: '4'.repeat(44) as Nonce,
            nonceAccountAddress: '9'.repeat(44) as Address,
        });
        await jest.runAllTimersAsync();
        expect(getAccountInfoMock).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: false }),
        });
        abortController.abort();
        expect(getAccountInfoMock).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: true }),
        });
    });
    it('calls the abort signal passed to the account subscription when aborted', () => {
        const abortController = new AbortController();
        getNonceInvalidationPromise({
            abortSignal: abortController.signal,
            commitment: 'finalized',
            currentNonceValue: '4'.repeat(44) as Nonce,
            nonceAccountAddress: '9'.repeat(44) as Address,
        });
        expect(createSubscriptionIterable).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: false }),
        });
        abortController.abort();
        expect(createSubscriptionIterable).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: true }),
        });
    });
    it('sets up a subscription for notifications about nonce account changes', async () => {
        expect.assertions(2);
        getNonceInvalidationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            currentNonceValue: '4'.repeat(44) as Nonce,
            nonceAccountAddress: '9'.repeat(44) as Address,
        });
        await jest.runAllTimersAsync();
        expect(createPendingSubscription).toHaveBeenCalledWith('9'.repeat(44), {
            commitment: 'finalized',
            encoding: 'base64',
        });
        expect(createSubscriptionIterable).toHaveBeenCalled();
    });
    it('does not fire off the one shot query for the nonce value until the subscription is set up', async () => {
        expect.assertions(2);
        let setupSubscription;
        createSubscriptionIterable.mockReturnValue(
            new Promise(resolve => {
                setupSubscription = resolve;
            }),
        );
        getNonceInvalidationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            currentNonceValue: '4'.repeat(44) as Nonce,
            nonceAccountAddress: '9'.repeat(44) as Address,
        });
        await jest.runAllTimersAsync();
        expect(getAccountInfoMock).not.toHaveBeenCalled();
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setupSubscription({
            [Symbol.asyncIterator]: accountNotificationGenerator,
        });
        await jest.runAllTimersAsync();
        expect(getAccountInfoMock).toHaveBeenCalled();
    });
    it('continues to pend when the nonce value returned by the one-shot query is the same as the expected one', async () => {
        expect.assertions(1);
        getAccountInfoMock.mockResolvedValue({
            value: {
                data: ['4'.repeat(44), 'base58'],
            },
        });
        const invalidationPromise = getNonceInvalidationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            currentNonceValue: '4'.repeat(44) as Nonce,
            nonceAccountAddress: '9'.repeat(44) as Address,
        });
        await jest.runAllTimersAsync();
        await expect(Promise.race([invalidationPromise, 'pending'])).resolves.toBe('pending');
    });
    it('fatals when the nonce account can not be found', async () => {
        expect.assertions(1);
        getAccountInfoMock.mockResolvedValue({ value: null });
        const invalidationPromise = getNonceInvalidationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            currentNonceValue: '4'.repeat(44) as Nonce,
            nonceAccountAddress: '9'.repeat(44) as Address,
        });
        await expect(invalidationPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND, {
                nonceAccountAddress: '9'.repeat(44),
            }),
        );
    });
    it('fatals when the nonce value returned by the one-shot query is different than the expected one', async () => {
        expect.assertions(1);
        getAccountInfoMock.mockResolvedValue({
            value: {
                data: ['5'.repeat(44), 'base58'],
            },
        });
        const invalidationPromise = getNonceInvalidationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            currentNonceValue: '4'.repeat(44) as Nonce,
            nonceAccountAddress: '9'.repeat(44) as Address,
        });
        await expect(invalidationPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__INVALID_NONCE, {
                actualNonceValue: '55555555555555555555555555555555555555555555',
                expectedNonceValue: '44444444444444444444444444444444444444444444',
            }),
        );
    });
    it('continues to pend when the nonce value returned by the account subscription is the same as the expected one', async () => {
        expect.assertions(1);
        accountNotificationGenerator.mockImplementation(async function* () {
            yield {
                value: {
                    data: getBase64EncodedNonceAccountData('4'.repeat(44) as Nonce),
                },
            };
            yield FOREVER_PROMISE;
        });
        const invalidationPromise = getNonceInvalidationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            currentNonceValue: '4'.repeat(44) as Nonce,
            nonceAccountAddress: '9'.repeat(44) as Address,
        });
        await jest.runAllTimersAsync();
        await expect(Promise.race([invalidationPromise, 'pending'])).resolves.toBe('pending');
    });
    it('fatals when the nonce value returned by the account subscription is different than the expected one', async () => {
        expect.assertions(1);
        accountNotificationGenerator.mockImplementation(async function* () {
            yield { value: { data: getBase64EncodedNonceAccountData('5'.repeat(44) as Nonce) } };
            yield FOREVER_PROMISE;
        });
        const invalidationPromise = getNonceInvalidationPromise({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            currentNonceValue: '4'.repeat(44) as Nonce,
            nonceAccountAddress: '9'.repeat(44) as Address,
        });
        await expect(invalidationPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__INVALID_NONCE, {
                actualNonceValue: '55555555555555555555555555555555555555555555',
                expectedNonceValue: '44444444444444444444444444444444444444444444',
            }),
        );
    });
});

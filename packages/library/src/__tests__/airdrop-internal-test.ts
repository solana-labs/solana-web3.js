import type { Address } from '@solana/addresses';
import type { Signature } from '@solana/keys';
import type { GetSignatureStatusesApi, RequestAirdropApi, Rpc } from '@solana/rpc';
import { lamports } from '@solana/rpc-types';

import { requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT } from '../airdrop-internal';

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

describe('requestAndConfirmAirdrop', () => {
    let confirmSignatureOnlyTransaction: jest.Mock;
    let rpc: Rpc<GetSignatureStatusesApi & RequestAirdropApi>;
    let requestAirdrop: jest.Mock;
    let sendAirdropRequest: jest.Mock;
    beforeEach(() => {
        jest.useFakeTimers();
        confirmSignatureOnlyTransaction = jest.fn().mockReturnValue(FOREVER_PROMISE);
        sendAirdropRequest = jest.fn().mockReturnValue(FOREVER_PROMISE);
        requestAirdrop = jest.fn().mockReturnValue({ send: sendAirdropRequest });
        rpc = {
            getSignatureStatuses: jest.fn().mockReturnValue({ send: jest.fn() }),
            requestAirdrop,
        };
    });
    it('aborts the `requestAirdrop` request when aborted', () => {
        const abortController = new AbortController();
        requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT({
            abortSignal: abortController.signal,
            commitment: 'finalized',
            confirmSignatureOnlyTransaction,
            lamports: lamports(1n),
            recipientAddress: '123' as Address,
            rpc,
        });
        expect(sendAirdropRequest).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: false }),
        });
        abortController.abort();
        expect(sendAirdropRequest).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: true }),
        });
    });
    it('aborts the `confirmSignatureOnlyTransaction` call when aborted', async () => {
        expect.assertions(2);
        const abortController = new AbortController();
        sendAirdropRequest.mockResolvedValue('abc' as Signature);
        requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT({
            abortSignal: abortController.signal,
            commitment: 'finalized',
            confirmSignatureOnlyTransaction,
            lamports: lamports(1n),
            recipientAddress: '123' as Address,
            rpc,
        });
        await jest.runAllTimersAsync();
        expect(confirmSignatureOnlyTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                abortSignal: expect.objectContaining({ aborted: false }),
            }),
        );
        abortController.abort();
        expect(confirmSignatureOnlyTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                abortSignal: expect.objectContaining({ aborted: true }),
            }),
        );
    });
    it('passes the expected input to the airdrop request', () => {
        sendAirdropRequest.mockResolvedValue('abc' as Signature);
        requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            confirmSignatureOnlyTransaction,
            lamports: lamports(1n),
            recipientAddress: '123' as Address,
            rpc,
        });
        expect(requestAirdrop).toHaveBeenCalledWith('123', 1n, { commitment: 'finalized' });
    });
    it('passes the expected input to the transaction confirmer', async () => {
        expect.assertions(1);
        sendAirdropRequest.mockResolvedValue('abc' as Signature);
        requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            confirmSignatureOnlyTransaction,
            lamports: lamports(1n),
            recipientAddress: '123' as Address,
            rpc,
        });
        await jest.runAllTimersAsync();
        expect(confirmSignatureOnlyTransaction).toHaveBeenCalledWith({
            abortSignal: expect.any(AbortSignal),
            commitment: 'finalized',
            signature: 'abc' as Signature,
        });
    });
    it('returns the airdrop transaction signature on success', async () => {
        expect.assertions(1);
        sendAirdropRequest.mockResolvedValue('abc' as Signature);
        confirmSignatureOnlyTransaction.mockResolvedValue(undefined);
        const airdropPromise = requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            confirmSignatureOnlyTransaction,
            lamports: lamports(1n),
            recipientAddress: '123' as Address,
            rpc,
        });
        await expect(airdropPromise).resolves.toBe('abc');
    });
});

import { Signature } from '@solana/keys';
import type { Rpc, SendTransactionApi } from '@solana/rpc';
import type { Commitment } from '@solana/rpc-types';
import {
    Base64EncodedWireTransaction,
    FullySignedTransaction,
    getBase64EncodedWireTransaction,
    TransactionWithBlockhashLifetime,
    TransactionWithDurableNonceLifetime,
} from '@solana/transactions';

import {
    sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT,
    sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT,
} from '../send-transaction-internal';

jest.mock('@solana/transactions');

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

describe('sendAndConfirmTransaction', () => {
    const MOCK_TRANSACTION = {} as FullySignedTransaction & TransactionWithBlockhashLifetime;
    let confirmRecentTransaction: jest.Mock;
    let createPendingRequest: jest.Mock;
    let rpc: Rpc<SendTransactionApi>;
    let sendTransaction: jest.Mock;
    beforeEach(() => {
        jest.useFakeTimers();
        confirmRecentTransaction = jest.fn().mockReturnValue(FOREVER_PROMISE);
        sendTransaction = jest.fn().mockReturnValue(FOREVER_PROMISE);
        createPendingRequest = jest.fn().mockReturnValue({ send: sendTransaction });
        rpc = {
            sendTransaction: createPendingRequest,
        };
        jest.mocked(getBase64EncodedWireTransaction).mockReturnValue(
            'MOCK_WIRE_TRANSACTION' as Base64EncodedWireTransaction,
        );
    });
    it('encodes the transaction into wire format before sending', () => {
        sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            confirmRecentTransaction,
            rpc,
            transaction: MOCK_TRANSACTION,
        }).catch(() => {});
        expect(getBase64EncodedWireTransaction).toHaveBeenCalledWith(MOCK_TRANSACTION);
        expect(createPendingRequest).toHaveBeenCalledWith('MOCK_WIRE_TRANSACTION', expect.anything());
    });
    it('calls `sendTransaction` with the expected inputs', () => {
        const sendTransactionConfig = {
            maxRetries: 42n,
            minContextSlot: 123n,
            preflightCommitment: 'confirmed' as Commitment,
            skipPreflight: false,
        } as Parameters<SendTransactionApi['sendTransaction']>[1];
        sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...sendTransactionConfig,
            abortSignal: new AbortController().signal,
            commitment: 'finalized' as Commitment,
            confirmRecentTransaction,
            rpc,
            transaction: MOCK_TRANSACTION,
        }).catch(() => {});
        expect(getBase64EncodedWireTransaction).toHaveBeenCalledWith(MOCK_TRANSACTION);
        expect(createPendingRequest).toHaveBeenCalledWith('MOCK_WIRE_TRANSACTION', {
            ...sendTransactionConfig,
            encoding: 'base64',
        });
    });
    it('calls `confirmRecentTransaction` with the expected inputs', async () => {
        expect.assertions(1);
        const sendTransactionConfig = {
            maxRetries: 42n,
            minContextSlot: 123n,
            preflightCommitment: 'confirmed' as Commitment,
            skipPreflight: false,
        } as Parameters<SendTransactionApi['sendTransaction']>[1];
        sendTransaction.mockResolvedValue('abc' as Signature);
        const abortSignal = new AbortController().signal;
        sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...sendTransactionConfig,
            abortSignal,
            commitment: 'finalized' as Commitment,
            confirmRecentTransaction,
            rpc,
            transaction: MOCK_TRANSACTION,
        }).catch(() => {});
        await jest.runAllTimersAsync();
        expect(confirmRecentTransaction).toHaveBeenCalledWith({
            abortSignal,
            commitment: 'finalized',
            transaction: MOCK_TRANSACTION,
        });
    });
    it.each`
        commitment     | expectedPreflightCommitment
        ${'processed'} | ${'processed'}
        ${'confirmed'} | ${'confirmed'}
    `(
        'when missing a `preflightCommitment` and the commitment is $commitment, applies a downgraded `preflightCommitment`',
        ({ commitment, expectedPreflightCommitment }) => {
            sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT({
                abortSignal: new AbortController().signal,
                commitment,
                confirmRecentTransaction,
                rpc,
                transaction: MOCK_TRANSACTION,
            }).catch(() => {});
            expect(createPendingRequest).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    preflightCommitment: expectedPreflightCommitment,
                }),
            );
        },
    );
    it.each`
        commitment     | preflightCommitment | expectedPreflightCommitment
        ${'processed'} | ${'processed'}      | ${'processed'}
        ${'processed'} | ${'confirmed'}      | ${'confirmed'}
        ${'processed'} | ${'finalized'}      | ${'finalized'}
        ${'confirmed'} | ${'processed'}      | ${'processed'}
        ${'confirmed'} | ${'confirmed'}      | ${'confirmed'}
        ${'confirmed'} | ${'finalized'}      | ${'finalized'}
        ${'finalized'} | ${'processed'}      | ${'processed'}
        ${'finalized'} | ${'confirmed'}      | ${'confirmed'}
        ${'finalized'} | ${'finalized'}      | ${'finalized'}
    `(
        'honours the explicit `preflightCommitment` no matter that the commitment is $commitment',
        ({ commitment, preflightCommitment, expectedPreflightCommitment }) => {
            sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT({
                abortSignal: new AbortController().signal,
                commitment,
                confirmRecentTransaction,
                preflightCommitment,
                rpc,
                transaction: MOCK_TRANSACTION,
            }).catch(() => {});
            expect(createPendingRequest).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    preflightCommitment: expectedPreflightCommitment,
                }),
            );
        },
    );
    it('when missing a `preflightCommitment` and the commitment is the same as the server default for `preflightCommitment`, does not apply a `preflightCommitment`', () => {
        expect.assertions(1);
        sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            confirmRecentTransaction,
            rpc,
            transaction: MOCK_TRANSACTION,
        }).catch(() => {});
        expect(createPendingRequest.mock.lastCall![1]).not.toHaveProperty('preflightCommitment');
    });
    it('returns the signature of the transaction', async () => {
        expect.assertions(1);
        sendTransaction.mockResolvedValue('abc');
        confirmRecentTransaction.mockResolvedValue(undefined);
        await expect(
            sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT({
                abortSignal: new AbortController().signal,
                commitment: 'finalized',
                confirmRecentTransaction,
                rpc,
                transaction: MOCK_TRANSACTION,
            }),
        ).resolves.toBe('abc');
    });
});

describe('sendAndConfirmDurableNonceTransaction', () => {
    const MOCK_DURABLE_NONCE_TRANSACTION = {} as unknown as FullySignedTransaction &
        TransactionWithDurableNonceLifetime;
    let confirmDurableNonceTransaction: jest.Mock;
    let createPendingRequest: jest.Mock;
    let rpc: Rpc<SendTransactionApi>;
    let sendTransaction: jest.Mock;
    beforeEach(() => {
        jest.useFakeTimers();
        confirmDurableNonceTransaction = jest.fn().mockReturnValue(FOREVER_PROMISE);
        sendTransaction = jest.fn().mockReturnValue(FOREVER_PROMISE);
        createPendingRequest = jest.fn().mockReturnValue({ send: sendTransaction });
        rpc = {
            sendTransaction: createPendingRequest,
        };
        jest.mocked(getBase64EncodedWireTransaction).mockReturnValue(
            'MOCK_WIRE_TRANSACTION' as Base64EncodedWireTransaction,
        );
    });
    it('encodes the transaction into wire format before sending', () => {
        sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            confirmDurableNonceTransaction,
            rpc,
            transaction: MOCK_DURABLE_NONCE_TRANSACTION,
        }).catch(() => {});
        expect(getBase64EncodedWireTransaction).toHaveBeenCalledWith(MOCK_DURABLE_NONCE_TRANSACTION);
        expect(createPendingRequest).toHaveBeenCalledWith('MOCK_WIRE_TRANSACTION', expect.anything());
    });
    it('calls `sendTransaction` with the expected inputs', () => {
        const sendTransactionConfig = {
            maxRetries: 42n,
            minContextSlot: 123n,
            preflightCommitment: 'confirmed' as Commitment,
            skipPreflight: false,
        } as Parameters<SendTransactionApi['sendTransaction']>[1];
        sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...sendTransactionConfig,
            abortSignal: new AbortController().signal,
            commitment: 'finalized' as Commitment,
            confirmDurableNonceTransaction,
            rpc,
            transaction: MOCK_DURABLE_NONCE_TRANSACTION,
        }).catch(() => {});
        expect(getBase64EncodedWireTransaction).toHaveBeenCalledWith(MOCK_DURABLE_NONCE_TRANSACTION);
        expect(createPendingRequest).toHaveBeenCalledWith('MOCK_WIRE_TRANSACTION', {
            ...sendTransactionConfig,
            encoding: 'base64',
        });
    });
    it('calls `confirmDurableNonceTransaction` with the expected inputs', async () => {
        expect.assertions(1);
        const sendTransactionConfig = {
            maxRetries: 42n,
            minContextSlot: 123n,
            preflightCommitment: 'confirmed' as Commitment,
            skipPreflight: false,
        } as Parameters<SendTransactionApi['sendTransaction']>[1];
        sendTransaction.mockResolvedValue('abc' as Signature);
        const abortSignal = new AbortController().signal;
        sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...sendTransactionConfig,
            abortSignal,
            commitment: 'finalized' as Commitment,
            confirmDurableNonceTransaction,
            rpc,
            transaction: MOCK_DURABLE_NONCE_TRANSACTION,
        }).catch(() => {});
        await jest.runAllTimersAsync();
        expect(confirmDurableNonceTransaction).toHaveBeenCalledWith({
            abortSignal,
            commitment: 'finalized',
            transaction: MOCK_DURABLE_NONCE_TRANSACTION,
        });
    });
    it.each`
        commitment     | expectedPreflightCommitment
        ${'processed'} | ${'processed'}
        ${'confirmed'} | ${'confirmed'}
    `(
        'when missing a `preflightCommitment` and the commitment is $commitment, applies a downgraded `preflightCommitment`',
        ({ commitment, expectedPreflightCommitment }) => {
            sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
                abortSignal: new AbortController().signal,
                commitment,
                confirmDurableNonceTransaction,
                rpc,
                transaction: MOCK_DURABLE_NONCE_TRANSACTION,
            }).catch(() => {});
            expect(createPendingRequest).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    preflightCommitment: expectedPreflightCommitment,
                }),
            );
        },
    );
    it.each`
        commitment     | preflightCommitment | expectedPreflightCommitment
        ${'processed'} | ${'processed'}      | ${'processed'}
        ${'processed'} | ${'confirmed'}      | ${'confirmed'}
        ${'processed'} | ${'finalized'}      | ${'finalized'}
        ${'confirmed'} | ${'processed'}      | ${'processed'}
        ${'confirmed'} | ${'confirmed'}      | ${'confirmed'}
        ${'confirmed'} | ${'finalized'}      | ${'finalized'}
        ${'finalized'} | ${'processed'}      | ${'processed'}
        ${'finalized'} | ${'confirmed'}      | ${'confirmed'}
        ${'finalized'} | ${'finalized'}      | ${'finalized'}
    `(
        'honours the explicit `preflightCommitment` no matter that the commitment is $commitment',
        ({ commitment, preflightCommitment, expectedPreflightCommitment }) => {
            sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
                abortSignal: new AbortController().signal,
                commitment,
                confirmDurableNonceTransaction,
                preflightCommitment,
                rpc,
                transaction: MOCK_DURABLE_NONCE_TRANSACTION,
            }).catch(() => {});
            expect(createPendingRequest).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    preflightCommitment: expectedPreflightCommitment,
                }),
            );
        },
    );
    it('when missing a `preflightCommitment` and the commitment is the same as the server default for `preflightCommitment`, does not apply a `preflightCommitment`', () => {
        expect.assertions(1);
        sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
            abortSignal: new AbortController().signal,
            commitment: 'finalized',
            confirmDurableNonceTransaction,
            rpc,
            transaction: MOCK_DURABLE_NONCE_TRANSACTION,
        }).catch(() => {});
        expect(createPendingRequest.mock.lastCall![1]).not.toHaveProperty('preflightCommitment');
    });
    it('returns the signature of the transaction', async () => {
        expect.assertions(1);
        sendTransaction.mockResolvedValue('abc');
        confirmDurableNonceTransaction.mockResolvedValue(undefined);
        await expect(
            sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
                abortSignal: new AbortController().signal,
                commitment: 'finalized',
                confirmDurableNonceTransaction,
                rpc,
                transaction: MOCK_DURABLE_NONCE_TRANSACTION,
            }),
        ).resolves.toBe('abc');
    });
});

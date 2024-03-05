import { Address } from '@solana/addresses';
import {
    SOLANA_ERROR__SIGNER__TRANSACTION_CANNOT_HAVE_MULTIPLE_SENDING_SIGNERS,
    SOLANA_ERROR__SIGNER__TRANSACTION_SENDING_SIGNER_MISSING,
    SolanaError,
} from '@solana/errors';

import {
    assertIsTransactionWithSingleSendingSigner,
    isTransactionWithSingleSendingSigner,
} from '../transaction-with-single-sending-signer';
import {
    createMockTransactionCompositeSigner,
    createMockTransactionModifyingSigner,
    createMockTransactionPartialSigner,
    createMockTransactionSendingSigner,
    createMockTransactionWithSigners,
} from './__setup__';

describe('isTransactionWithSingleSendingSigner', () => {
    it('returns true if a transaction contains a single sending only signer', () => {
        // Given a transaction with a single sending signer.
        const signer = createMockTransactionSendingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signer]);

        // Then we expect it to be a valid `TransactionWithSingleSendingSigner`.
        expect(isTransactionWithSingleSendingSigner(transaction)).toBe(true);
    });

    it('returns true if a transaction contains multiple sending signer composites', () => {
        // Given a transaction with a two sending signers that can also be used as other signer interfaces.
        const signerA = createMockTransactionCompositeSigner('1111' as Address);
        const signerB = createMockTransactionCompositeSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // Then we expect it to be a valid `TransactionWithSingleSendingSigner` because we can use
        // one of them as a sending signer and the other as a modifying or partial signer.
        expect(isTransactionWithSingleSendingSigner(transaction)).toBe(true);
    });

    it('returns false if a transaction contains multiple sending only signer', () => {
        // Given a transaction with a two sending only signers.
        const signerA = createMockTransactionSendingSigner('1111' as Address);
        const signerB = createMockTransactionSendingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // Then we expect it not to be a valid `TransactionWithSingleSendingSigner`.
        expect(isTransactionWithSingleSendingSigner(transaction)).toBe(false);
    });

    it('returns false if a transaction contains no sending signer at all', () => {
        // Given a transaction with no sending signer.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionModifyingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // Then we expect it not to be a valid `TransactionWithSingleSendingSigner`.
        expect(isTransactionWithSingleSendingSigner(transaction)).toBe(false);
    });
});

describe('assertIsTransactionWithSingleSendingSigner', () => {
    it('succeeds if a transaction contains a single sending only signer', () => {
        // Given a transaction with a single sending signer.
        const signer = createMockTransactionSendingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signer]);

        // Then we expect the assertion to succeed.
        expect(() => assertIsTransactionWithSingleSendingSigner(transaction)).not.toThrow();
    });

    it('succeeds if a transaction contains multiple sending signer composites', () => {
        // Given a transaction with a two sending signers that can also be used as other signer interfaces.
        const signerA = createMockTransactionCompositeSigner('1111' as Address);
        const signerB = createMockTransactionCompositeSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // Then we expect the assertion to succeed because we can use one of them
        // as a sending signer and the other as a modifying or partial signer.
        expect(() => assertIsTransactionWithSingleSendingSigner(transaction)).not.toThrow();
    });

    it('fails if a transaction contains multiple sending only signer', () => {
        // Given a transaction with a two sending only signers.
        const signerA = createMockTransactionSendingSigner('1111' as Address);
        const signerB = createMockTransactionSendingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // Then we expect the assertion to fail.
        expect(() => assertIsTransactionWithSingleSendingSigner(transaction)).toThrow(
            new SolanaError(SOLANA_ERROR__SIGNER__TRANSACTION_CANNOT_HAVE_MULTIPLE_SENDING_SIGNERS),
        );
    });

    it('fails if a transaction contains no sending signer at all', () => {
        // Given a transaction with no sending signer.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionModifyingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // Then we expect the assertion to fail.
        expect(() => assertIsTransactionWithSingleSendingSigner(transaction)).toThrow(
            new SolanaError(SOLANA_ERROR__SIGNER__TRANSACTION_SENDING_SIGNER_MISSING),
        );
    });
});

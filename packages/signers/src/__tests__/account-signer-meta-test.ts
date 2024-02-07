import { Address } from '@solana/addresses';
import { createTransaction } from '@solana/transactions';

import { getSignersFromInstruction, getSignersFromTransaction } from '../account-signer-meta';
import { setTransactionFeePayerSigner } from '../fee-payer-signer';
import {
    createMockInstructionWithSigners,
    createMockTransactionModifyingSigner,
    createMockTransactionPartialSigner,
    createMockTransactionWithSigners,
} from './__setup__';

describe('getSignersFromInstruction', () => {
    it('extracts signers from the account meta of the provided instruction', () => {
        // Given an instruction with two signers A and B.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionModifyingSigner('2222' as Address);
        const instruction = createMockInstructionWithSigners([signerA, signerB]);

        // When we extract the signers from the instruction's account metas.
        const extractedSigners = getSignersFromInstruction(instruction);

        // Then we expect signer A and B to be part of the extracted signers.
        expect(extractedSigners).toHaveLength(2);
        expect(extractedSigners[0]).toBe(signerA);
        expect(extractedSigners[1]).toBe(signerB);
    });

    it('removes duplicated signers by reference', () => {
        // Given an instruction with duplicated signers using the same reference.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionModifyingSigner('2222' as Address);
        const instruction = createMockInstructionWithSigners([signerA, signerB, signerA, signerA]);

        // When we extract the signers from the instruction's account metas.
        const extractedSigners = getSignersFromInstruction(instruction);

        // Then we expect the extracted signers to be deduplicated.
        expect(extractedSigners).toHaveLength(2);
        expect(extractedSigners.map(signer => signer.address).sort()).toStrictEqual(['1111', '2222']);
    });
});

describe('getSignersFromTransaction', () => {
    it('extracts signers from the account meta of the provided transaction', () => {
        // Given a transaction with two signers A and B.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionModifyingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // When we extract the signers from the transaction's account metas.
        const extractedSigners = getSignersFromTransaction(transaction);

        // Then we expect signer A and B to be part of the extracted signers.
        expect(extractedSigners).toHaveLength(2);
        expect(extractedSigners[0]).toBe(signerA);
        expect(extractedSigners[1]).toBe(signerB);
    });

    it('extracts the fee payer signer of the provided transaction', () => {
        // Given a transaction with a signer fee payer.
        const feePayerSigner = createMockTransactionPartialSigner('1111' as Address);
        const transaction = setTransactionFeePayerSigner(feePayerSigner, createTransaction({ version: 0 }));

        // When we extract the signers from the transaction.
        const extractedSigners = getSignersFromTransaction(transaction);

        // Then we expect the extracted signers to contain the fee payer signer.
        expect(extractedSigners).toHaveLength(1);
        expect(extractedSigners[0]).toBe(feePayerSigner);
    });

    it('removes duplicated signers', () => {
        // Given a transaction with duplicated signers using the same reference.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionModifyingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB, signerA, signerA]);

        // When we extract the signers from the transaction's account metas.
        const extractedSigners = getSignersFromTransaction(transaction);

        // Then we expect the extracted signers to be deduplicated.
        expect(extractedSigners).toHaveLength(2);
        expect(extractedSigners.map(signer => signer.address).sort()).toStrictEqual(['1111', '2222']);
    });
});

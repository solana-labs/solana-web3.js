import { Address } from '@solana/addresses';

import { getSignersFromInstruction, getSignersFromTransaction } from '../account-signer-meta';
import {
    createMockInstructionWithSigners,
    createMockTransactionModifyingSigner,
    createMockTransactionPartialSigner,
    createMockTransactionSendingSigner,
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

    it('removes duplicated signers', () => {
        // Given an instruction with duplicated signers.
        const addressA = '1111' as Address;
        const addressB = '2222' as Address;
        const signers = [
            createMockTransactionPartialSigner(addressA),
            createMockTransactionPartialSigner(addressB),
            createMockTransactionModifyingSigner(addressA),
            createMockTransactionSendingSigner(addressA),
        ];
        const instruction = createMockInstructionWithSigners(signers);

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

    it('removes duplicated signers', () => {
        // Given a transaction with duplicated signers.
        const addressA = '1111' as Address;
        const addressB = '2222' as Address;
        const signers = [
            createMockTransactionPartialSigner(addressA),
            createMockTransactionPartialSigner(addressB),
            createMockTransactionModifyingSigner(addressA),
            createMockTransactionSendingSigner(addressA),
        ];
        const transaction = createMockTransactionWithSigners(signers);

        // When we extract the signers from the transaction's account metas.
        const extractedSigners = getSignersFromTransaction(transaction);

        // Then we expect the extracted signers to be deduplicated.
        expect(extractedSigners).toHaveLength(2);
        expect(extractedSigners.map(signer => signer.address).sort()).toStrictEqual(['1111', '2222']);
    });
});

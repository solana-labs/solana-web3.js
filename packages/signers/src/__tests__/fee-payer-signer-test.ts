import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import { BaseTransactionMessage, ITransactionMessageWithFeePayer } from '@solana/transaction-messages';

import { ITransactionMessageWithFeePayerSigner, setTransactionMessageFeePayerSigner } from '../fee-payer-signer';
import { TransactionSigner } from '../transaction-signer';
import { createMockTransactionPartialSigner } from './__setup__';

describe('setTransactionMessageFeePayerSigner', () => {
    let feePayerA: TransactionSigner;
    let feePayerB: TransactionSigner;
    let baseTx: BaseTransactionMessage;
    beforeEach(() => {
        baseTx = { instructions: [], version: 0 };
        feePayerA = createMockTransactionPartialSigner('1111' as Address);
        feePayerB = createMockTransactionPartialSigner('2222' as Address);
    });
    it('sets the fee payer signer on the transaction', () => {
        const txWithFeePayerA = setTransactionMessageFeePayerSigner(feePayerA, baseTx);
        expect(txWithFeePayerA).toHaveProperty('feePayer', feePayerA);
    });
    describe('given a transaction with a fee payer signer already set', () => {
        let txWithFeePayerA: BaseTransactionMessage & ITransactionMessageWithFeePayerSigner;
        beforeEach(() => {
            txWithFeePayerA = { ...baseTx, feePayer: feePayerA };
        });
        it('overrides the fee payer signer when it differs from the existing one', () => {
            const txWithFeePayerB = setTransactionMessageFeePayerSigner(feePayerB, txWithFeePayerA);
            expect(txWithFeePayerB).toHaveProperty('feePayer', feePayerB);
        });
        it('overrides the fee payer signer even when the existing fee payer address is the same', () => {
            const txWithSameFeePayer = setTransactionMessageFeePayerSigner(feePayerA, txWithFeePayerA);
            expect(txWithSameFeePayer).toHaveProperty('feePayer', feePayerA);
            expect(txWithSameFeePayer).not.toBe(txWithFeePayerA);
        });
    });
    describe('given a transaction with a non-signer fee payer already set', () => {
        let txWithFeePayerA: BaseTransactionMessage & ITransactionMessageWithFeePayer;
        beforeEach(() => {
            txWithFeePayerA = { ...baseTx, feePayer: { address: feePayerA.address } };
        });
        it('overrides the fee payer when it differs from the existing one', () => {
            const txWithFeePayerB = setTransactionMessageFeePayerSigner(feePayerB, txWithFeePayerA);
            expect(txWithFeePayerB).toHaveProperty('feePayer', feePayerB);
        });
        it('overrides the fee payer even when the existing fee payer address is the same', () => {
            const txWithSameFeePayer = setTransactionMessageFeePayerSigner(feePayerA, txWithFeePayerA);
            expect(txWithSameFeePayer).toHaveProperty('feePayer', feePayerA);
            expect(txWithFeePayerA).not.toBe(txWithSameFeePayer);
        });
    });
    it('freezes the object', () => {
        const txWithFeePayer = setTransactionMessageFeePayerSigner(feePayerA, baseTx);
        expect(txWithFeePayer).toBeFrozenObject();
    });
});

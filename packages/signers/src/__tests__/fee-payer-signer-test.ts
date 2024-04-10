import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import { BaseTransactionMessage, ITransactionMessageWithFeePayer } from '@solana/transaction-messages';

import { ITransactionMessageWithFeePayerSigner, setTransactionFeePayerSigner } from '../fee-payer-signer';
import { TransactionSigner } from '../transaction-signer';
import { createMockTransactionPartialSigner } from './__setup__';

describe('setTransactionFeePayerSigner', () => {
    let feePayerSignerA: TransactionSigner;
    let feePayerSignerB: TransactionSigner;
    let baseTx: BaseTransactionMessage;
    beforeEach(() => {
        baseTx = { instructions: [], version: 0 };
        feePayerSignerA = createMockTransactionPartialSigner('1111' as Address);
        feePayerSignerB = createMockTransactionPartialSigner('2222' as Address);
    });
    it('sets the fee payer signer on the transaction', () => {
        const txWithFeePayerA = setTransactionFeePayerSigner(feePayerSignerA, baseTx);
        expect(txWithFeePayerA).toHaveProperty('feePayer', feePayerSignerA.address);
        expect(txWithFeePayerA).toHaveProperty('feePayerSigner', feePayerSignerA);
    });
    describe('given a transaction with a fee payer signer already set', () => {
        let txWithFeePayerA: BaseTransactionMessage & ITransactionMessageWithFeePayerSigner;
        beforeEach(() => {
            txWithFeePayerA = {
                ...baseTx,
                feePayer: feePayerSignerA.address,
                feePayerSigner: feePayerSignerA,
            };
        });
        it('sets the new fee payer on the transaction when it differs from the existing one', () => {
            const txWithFeePayerB = setTransactionFeePayerSigner(feePayerSignerB, txWithFeePayerA);
            expect(txWithFeePayerB).toHaveProperty('feePayer', feePayerSignerB.address);
            expect(txWithFeePayerB).toHaveProperty('feePayerSigner', feePayerSignerB);
        });
        it('returns the original transaction when trying to set the same fee payer again', () => {
            const txWithSameFeePayer = setTransactionFeePayerSigner(feePayerSignerA, txWithFeePayerA);
            expect(txWithFeePayerA).toBe(txWithSameFeePayer);
        });
    });
    describe('given a transaction with a non-signer fee payer already set', () => {
        let txWithFeePayerA: BaseTransactionMessage & ITransactionMessageWithFeePayer;
        beforeEach(() => {
            txWithFeePayerA = {
                ...baseTx,
                feePayer: feePayerSignerA.address,
            };
        });
        it('sets the new fee payer on the transaction when it differs from the existing one', () => {
            const txWithFeePayerB = setTransactionFeePayerSigner(feePayerSignerB, txWithFeePayerA);
            expect(txWithFeePayerB).toHaveProperty('feePayer', feePayerSignerB.address);
            expect(txWithFeePayerB).toHaveProperty('feePayerSigner', feePayerSignerB);
        });
        it('returns a new transaction instance when setting the same fee payer but as a signer this time', () => {
            const txWithSameFeePayer = setTransactionFeePayerSigner(feePayerSignerA, txWithFeePayerA);
            expect(txWithSameFeePayer).toHaveProperty('feePayer', feePayerSignerA.address);
            expect(txWithSameFeePayer).toHaveProperty('feePayerSigner', feePayerSignerA);
            expect(txWithFeePayerA).not.toBe(txWithSameFeePayer);
        });
    });
    it('freezes the object', () => {
        const txWithFeePayer = setTransactionFeePayerSigner(feePayerSignerA, baseTx);
        expect(txWithFeePayer).toBeFrozenObject();
    });
});

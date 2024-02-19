import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';

import { ITransactionWithFeePayer, setTransactionFeePayer } from '../fee-payer';
import { ITransactionWithSignatures } from '../signatures';
import { BaseTransaction } from '../types';

const EXAMPLE_FEE_PAYER_A =
    '7mvYAxeCui21xYkAyQSjh6iBVZPpgVyt7PYv9km8V5mE' as Address<'7mvYAxeCui21xYkAyQSjh6iBVZPpgVyt7PYv9km8V5mE'>;
const EXAMPLE_FEE_PAYER_B =
    '5LHng8dLBxCYyR3jdDbobLiRQ6pR74pYtxKohY93RbZN' as Address<'5LHng8dLBxCYyR3jdDbobLiRQ6pR74pYtxKohY93RbZN'>;

describe('setTransactionFeePayer', () => {
    let baseTx: BaseTransaction;
    beforeEach(() => {
        baseTx = {
            instructions: [],
            version: 0,
        };
    });
    it('sets the fee payer on the transaction', () => {
        const txWithFeePayerA = setTransactionFeePayer(EXAMPLE_FEE_PAYER_A, baseTx);
        expect(txWithFeePayerA).toHaveProperty('feePayer', EXAMPLE_FEE_PAYER_A);
    });
    describe('given a transaction with a fee payer already set', () => {
        let txWithFeePayerA: BaseTransaction & ITransactionWithFeePayer;
        beforeEach(() => {
            txWithFeePayerA = {
                ...baseTx,
                feePayer: EXAMPLE_FEE_PAYER_A,
            };
        });
        it('sets the new fee payer on the transaction when it differs from the existing one', () => {
            const txWithFeePayerB = setTransactionFeePayer(EXAMPLE_FEE_PAYER_B, txWithFeePayerA);
            expect(txWithFeePayerB).toHaveProperty('feePayer', EXAMPLE_FEE_PAYER_B);
        });
        it('returns the original transaction when trying to set the same fee payer again', () => {
            const txWithSameFeePayer = setTransactionFeePayer(EXAMPLE_FEE_PAYER_A, txWithFeePayerA);
            expect(txWithFeePayerA).toBe(txWithSameFeePayer);
        });
        describe('given that transaction also has signatures', () => {
            let txWithFeePayerAndSignatures: BaseTransaction & ITransactionWithFeePayer & ITransactionWithSignatures;
            beforeEach(() => {
                txWithFeePayerAndSignatures = {
                    ...txWithFeePayerA,
                    signatures: {},
                };
            });
            it('does not clear the signatures when the fee payer is the same as the current one', () => {
                expect(setTransactionFeePayer(EXAMPLE_FEE_PAYER_A, txWithFeePayerAndSignatures)).toHaveProperty(
                    'signatures',
                    txWithFeePayerAndSignatures.signatures,
                );
            });
            it('clears the signatures when the fee payer is different than the current one', () => {
                expect(setTransactionFeePayer(EXAMPLE_FEE_PAYER_B, txWithFeePayerAndSignatures)).not.toHaveProperty(
                    'signatures',
                );
            });
        });
    });
    it('freezes the object', () => {
        const txWithFeePayer = setTransactionFeePayer(EXAMPLE_FEE_PAYER_A, baseTx);
        expect(txWithFeePayer).toBeFrozenObject();
    });
});

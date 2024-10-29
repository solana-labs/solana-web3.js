import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';

import { ITransactionMessageWithFeePayer, setTransactionMessageFeePayer } from '../fee-payer';
import { BaseTransactionMessage } from '../transaction-message';

const EXAMPLE_FEE_PAYER_A =
    '7mvYAxeCui21xYkAyQSjh6iBVZPpgVyt7PYv9km8V5mE' as Address<'7mvYAxeCui21xYkAyQSjh6iBVZPpgVyt7PYv9km8V5mE'>;
const EXAMPLE_FEE_PAYER_B =
    '5LHng8dLBxCYyR3jdDbobLiRQ6pR74pYtxKohY93RbZN' as Address<'5LHng8dLBxCYyR3jdDbobLiRQ6pR74pYtxKohY93RbZN'>;

describe('setTransactionMessageFeePayer', () => {
    let baseTx: BaseTransactionMessage;
    beforeEach(() => {
        baseTx = {
            instructions: [],
            version: 0,
        };
    });
    it('sets the fee payer on the transaction', () => {
        const txWithFeePayerA = setTransactionMessageFeePayer(EXAMPLE_FEE_PAYER_A, baseTx);
        expect(txWithFeePayerA).toHaveProperty('feePayer', { address: EXAMPLE_FEE_PAYER_A });
    });
    describe('given a transaction with a fee payer already set', () => {
        let txWithFeePayerA: BaseTransactionMessage & ITransactionMessageWithFeePayer;
        beforeEach(() => {
            txWithFeePayerA = {
                ...baseTx,
                feePayer: { address: EXAMPLE_FEE_PAYER_A },
            };
        });
        it('sets the new fee payer on the transaction when it differs from the existing one', () => {
            const txWithFeePayerB = setTransactionMessageFeePayer(EXAMPLE_FEE_PAYER_B, txWithFeePayerA);
            expect(txWithFeePayerB).toHaveProperty('feePayer', { address: EXAMPLE_FEE_PAYER_B });
        });
        it('returns the original transaction when trying to set the same fee payer again', () => {
            const txWithSameFeePayer = setTransactionMessageFeePayer(EXAMPLE_FEE_PAYER_A, txWithFeePayerA);
            expect(txWithFeePayerA).toBe(txWithSameFeePayer);
        });
    });
    describe('given a transaction with a fee payer with extra properties set', () => {
        let txWithFeePayerA: BaseTransactionMessage & {
            readonly feePayer: Readonly<{ address: Address; extra: 'extra' }>;
        };
        beforeEach(() => {
            txWithFeePayerA = {
                ...baseTx,
                feePayer: { address: EXAMPLE_FEE_PAYER_A, extra: 'extra' },
            };
        });
        it('sets the new fee payer on the transaction when it differs from the existing one', () => {
            const txWithFeePayerB = setTransactionMessageFeePayer(EXAMPLE_FEE_PAYER_B, txWithFeePayerA);
            expect(txWithFeePayerB).toHaveProperty('feePayer', { address: EXAMPLE_FEE_PAYER_B });
        });
        it('sets the new fee payer on the transaction even when it is the same as the existing one', () => {
            const txWithSameFeePayer = setTransactionMessageFeePayer(EXAMPLE_FEE_PAYER_A, txWithFeePayerA);
            expect(txWithSameFeePayer).toHaveProperty('feePayer', { address: EXAMPLE_FEE_PAYER_A });
            expect(txWithSameFeePayer).not.toBe(txWithFeePayerA);
        });
    });
    it('freezes the object', () => {
        const txWithFeePayer = setTransactionMessageFeePayer(EXAMPLE_FEE_PAYER_A, baseTx);
        expect(txWithFeePayer).toBeFrozenObject();
    });
});

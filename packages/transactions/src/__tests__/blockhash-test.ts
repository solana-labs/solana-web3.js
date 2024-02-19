import '@solana/test-matchers/toBeFrozenObject';

import { getBase58Encoder } from '@solana/codecs-strings';
import type { Blockhash } from '@solana/rpc-types';

import {
    assertIsTransactionWithBlockhashLifetime,
    ITransactionWithBlockhashLifetime,
    setTransactionLifetimeUsingBlockhash,
} from '../blockhash';
import { ITransactionWithSignatures } from '../signatures';
import { BaseTransaction } from '../types';

jest.mock('@solana/codecs-strings', () => ({
    ...jest.requireActual('@solana/codecs-strings'),
    getBase58Encoder: jest.fn(),
}));

// real implementations
const originalBase58Module = jest.requireActual('@solana/codecs-strings');
const originalGetBase58Encoder = originalBase58Module.getBase58Encoder();

describe('assertIsBlockhashLifetimeTransaction', () => {
    beforeEach(() => {
        // use real implementation
        jest.mocked(getBase58Encoder).mockReturnValue(originalGetBase58Encoder);
    });
    it('throws for a transaction with no lifetime constraint', () => {
        const transaction: BaseTransaction = {
            instructions: [],
            version: 0,
        };
        expect(() => assertIsTransactionWithBlockhashLifetime(transaction)).toThrow();
    });
    it('throws for a transaction with a durable nonce constraint', () => {
        const transaction = {
            instructions: [],
            lifetimeConstraint: {
                nonce: 'abcd',
            },
            version: 0,
        } as unknown as BaseTransaction;
        expect(() => assertIsTransactionWithBlockhashLifetime(transaction)).toThrow();
    });
    it('throws for a transaction with a blockhash but no lastValidBlockHeight in lifetimeConstraint', () => {
        const transaction = {
            instructions: [],
            lifetimeConstraint: {
                blockhash: '11111111111111111111111111111111',
            },
            version: 0,
        } as unknown as BaseTransaction;
        expect(() => assertIsTransactionWithBlockhashLifetime(transaction)).toThrow();
    });
    it('throws for a transaction with a lastValidBlockHeight but no blockhash in lifetimeConstraint', () => {
        const transaction = {
            instructions: [],
            lifetimeConstraint: {
                lastValidBlockHeight: 1234n,
            },
            version: 0,
        } as unknown as BaseTransaction;
        expect(() => assertIsTransactionWithBlockhashLifetime(transaction)).toThrow();
    });
    it('throws for a transaction with a blockhash lifetime but an invalid blockhash value', () => {
        const transaction = {
            instructions: [],
            lifetimeConstraint: {
                blockhash: 'not a valid blockhash value',
            },
            version: 0,
        } as unknown as BaseTransaction;
        expect(() => assertIsTransactionWithBlockhashLifetime(transaction)).toThrow();
    });
    it('does not throw for a transaction with a valid blockhash lifetime constraint', () => {
        const transaction = {
            instructions: [],
            lifetimeConstraint: {
                blockhash: '11111111111111111111111111111111',
                lastValidBlockHeight: 1234n,
            },
            version: 0,
        } as unknown as BaseTransaction;
        expect(() => assertIsTransactionWithBlockhashLifetime(transaction)).not.toThrow();
    });
});

describe('setTransactionLifetimeUsingBlockhash', () => {
    let baseTx: BaseTransaction;
    const BLOCKHASH_CONSTRAINT_A = {
        blockhash: 'F7vmkY3DTaxfagttWjQweib42b6ZHADSx94Tw8gHx3W7' as Blockhash,
        lastValidBlockHeight: 123n,
    };
    const BLOCKHASH_CONSTRAINT_B = {
        blockhash: '6bjroqDcZgTv6Vavhqf81oBHTv3aMnX19UTB51YhAZnN' as Blockhash,
        lastValidBlockHeight: 123n,
    };
    beforeEach(() => {
        baseTx = {
            instructions: [],
            version: 0,
        };
    });
    it('sets the lifetime constraint on the transaction to the supplied blockhash lifetime constraint', () => {
        const txWithBlockhashLifetimeConstraint = setTransactionLifetimeUsingBlockhash(BLOCKHASH_CONSTRAINT_A, baseTx);
        expect(txWithBlockhashLifetimeConstraint).toHaveProperty('lifetimeConstraint', BLOCKHASH_CONSTRAINT_A);
    });
    describe('given a transaction with a blockhash lifetime already set', () => {
        let txWithBlockhashLifetimeConstraint: BaseTransaction & ITransactionWithBlockhashLifetime;
        beforeEach(() => {
            txWithBlockhashLifetimeConstraint = {
                ...baseTx,
                lifetimeConstraint: BLOCKHASH_CONSTRAINT_A,
            };
        });
        it('sets the new blockhash lifetime constraint on the transaction when it differs from the existing one', () => {
            const txWithBlockhashLifetimeConstraintB = setTransactionLifetimeUsingBlockhash(
                BLOCKHASH_CONSTRAINT_B,
                txWithBlockhashLifetimeConstraint,
            );
            expect(txWithBlockhashLifetimeConstraintB).toHaveProperty('lifetimeConstraint', BLOCKHASH_CONSTRAINT_B);
        });
        it('returns the original transaction when trying to set the same blockhash lifetime constraint again', () => {
            const txWithSameBlockhashLifetimeConstraint = setTransactionLifetimeUsingBlockhash(
                BLOCKHASH_CONSTRAINT_A,
                txWithBlockhashLifetimeConstraint,
            );
            expect(txWithBlockhashLifetimeConstraint).toBe(txWithSameBlockhashLifetimeConstraint);
        });
        describe('given that transaction also has signatures', () => {
            let txWithBlockhashLifetimeConstraintAndSignatures: BaseTransaction &
                ITransactionWithBlockhashLifetime &
                ITransactionWithSignatures;
            beforeEach(() => {
                txWithBlockhashLifetimeConstraintAndSignatures = {
                    ...txWithBlockhashLifetimeConstraint,
                    signatures: {},
                };
            });
            it('does not clear the signatures when the blockhash lifetime constraint is the same as the current one', () => {
                expect(
                    setTransactionLifetimeUsingBlockhash(
                        BLOCKHASH_CONSTRAINT_A,
                        txWithBlockhashLifetimeConstraintAndSignatures,
                    ),
                ).toHaveProperty('signatures', txWithBlockhashLifetimeConstraintAndSignatures.signatures);
            });
            it('clears the signatures when the blockhash lifetime constraint is different than the current one', () => {
                expect(
                    setTransactionLifetimeUsingBlockhash(
                        BLOCKHASH_CONSTRAINT_B,
                        txWithBlockhashLifetimeConstraintAndSignatures,
                    ),
                ).not.toHaveProperty('signatures');
            });
        });
    });
    it('freezes the object', () => {
        const txWithBlockhashLifetimeConstraint = setTransactionLifetimeUsingBlockhash(BLOCKHASH_CONSTRAINT_A, baseTx);
        expect(txWithBlockhashLifetimeConstraint).toBeFrozenObject();
    });
});

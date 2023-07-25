import 'test-matchers/toBeFrozenObject';

import { base58 } from '@metaplex-foundation/umi-serializers';

import {
    assertIsBlockhash,
    Blockhash,
    ITransactionWithBlockhashLifetime,
    setTransactionLifetimeUsingBlockhash,
} from '../blockhash';
import { ITransactionWithSignatures } from '../signatures';
import { BaseTransaction } from '../types';

describe('assertIsBlockhash()', () => {
    it('throws when supplied a non-base58 string', () => {
        expect(() => {
            assertIsBlockhash('not-a-base-58-encoded-string');
        }).toThrow();
    });
    it('throws when the decoded byte array has a length other than 32 bytes', () => {
        expect(() => {
            assertIsBlockhash(
                // 31 bytes [128, ..., 128]
                '2xea9jWJ9eca3dFiefTeSPP85c6qXqunCqL2h2JNffM'
            );
        }).toThrow();
    });
    it('does not throw when supplied a base-58 encoded hash', () => {
        expect(() => {
            assertIsBlockhash('11111111111111111111111111111111');
        }).not.toThrow();
    });
    it('returns undefined when supplied a base-58 encoded hash', () => {
        expect(assertIsBlockhash('11111111111111111111111111111111')).toBeUndefined();
    });
    [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44].forEach(len => {
        it(`attempts to decode input strings of exactly ${len} characters`, () => {
            const decodeMethod = jest.spyOn(base58, 'serialize');
            try {
                assertIsBlockhash('1'.repeat(len));
                // eslint-disable-next-line no-empty
            } catch {}
            expect(decodeMethod).toHaveBeenCalled();
        });
    });
    it('does not attempt to decode too-short input strings', () => {
        const decodeMethod = jest.spyOn(base58, 'serialize');
        try {
            assertIsBlockhash(
                // 31 bytes [0, ..., 0]
                '1111111111111111111111111111111' // 31 characters
            );
            // eslint-disable-next-line no-empty
        } catch {}
        expect(decodeMethod).not.toHaveBeenCalled();
    });
    it('does not attempt to decode too-long input strings', () => {
        const decodeMethod = jest.spyOn(base58, 'serialize');
        try {
            assertIsBlockhash(
                // 33 bytes [0, 255, ..., 255]
                '1JEKNVnkbo3jma5nREBBJCDoXFVeKkD56V3xKrvRmWxFG' // 45 characters
            );
            // eslint-disable-next-line no-empty
        } catch {}
        expect(decodeMethod).not.toHaveBeenCalled();
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
                txWithBlockhashLifetimeConstraint
            );
            expect(txWithBlockhashLifetimeConstraintB).toHaveProperty('lifetimeConstraint', BLOCKHASH_CONSTRAINT_B);
        });
        it('returns the original transaction when trying to set the same blockhash lifetime constraint again', () => {
            const txWithSameBlockhashLifetimeConstraint = setTransactionLifetimeUsingBlockhash(
                BLOCKHASH_CONSTRAINT_A,
                txWithBlockhashLifetimeConstraint
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
                        txWithBlockhashLifetimeConstraintAndSignatures
                    )
                ).toHaveProperty('signatures', txWithBlockhashLifetimeConstraintAndSignatures.signatures);
            });
            it('clears the signatures when the blockhash lifetime constraint is different than the current one', () => {
                expect(
                    setTransactionLifetimeUsingBlockhash(
                        BLOCKHASH_CONSTRAINT_B,
                        txWithBlockhashLifetimeConstraintAndSignatures
                    )
                ).not.toHaveProperty('signatures');
            });
        });
    });
    it('freezes the object', () => {
        const txWithBlockhashLifetimeConstraint = setTransactionLifetimeUsingBlockhash(BLOCKHASH_CONSTRAINT_A, baseTx);
        expect(txWithBlockhashLifetimeConstraint).toBeFrozenObject();
    });
});

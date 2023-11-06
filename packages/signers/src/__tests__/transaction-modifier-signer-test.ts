import { address } from '@solana/addresses';

import {
    assertIsTransactionModifierSigner,
    isTransactionModifierSigner,
    TransactionModifierSigner,
} from '../transaction-modifier-signer';

describe('isTransactionModifierSigner', () => {
    it('checks whether a given value is a TransactionModifierSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            modifyAndSignTransaction: async () => [],
        } satisfies TransactionModifierSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isTransactionModifierSigner(mySigner)).toBe(true);
        expect(isTransactionModifierSigner({ address: myAddress })).toBe(false);
        expect(isTransactionModifierSigner({ address: myAddress, modifyAndSignTransaction: 42 })).toBe(false);
    });
});

describe('assertIsTransactionModifierSigner', () => {
    it('asserts that a given value is a TransactionModifierSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            modifyAndSignTransaction: async () => [],
        } satisfies TransactionModifierSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement the TransactionModifierSigner interface';
        expect(() => assertIsTransactionModifierSigner(mySigner)).not.toThrow();
        expect(() => assertIsTransactionModifierSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsTransactionModifierSigner({ address: myAddress, modifyAndSignTransaction: 42 })).toThrow(
            expectedMessage
        );
    });
});

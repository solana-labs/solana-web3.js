import { address } from '@solana/addresses';

import {
    assertIsTransactionPartialSigner,
    isTransactionPartialSigner,
    TransactionPartialSigner,
} from '../transaction-partial-signer';

describe('isTransactionPartialSigner', () => {
    it('checks whether a given value is a TransactionPartialSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            signTransactions: async () => [],
        } satisfies TransactionPartialSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isTransactionPartialSigner(mySigner)).toBe(true);
        expect(isTransactionPartialSigner({ address: myAddress })).toBe(false);
        expect(isTransactionPartialSigner({ address: myAddress, signTransactions: 42 })).toBe(false);
    });
});

describe('assertIsTransactionPartialSigner', () => {
    it('asserts that a given value is a TransactionPartialSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            signTransactions: async () => [],
        } satisfies TransactionPartialSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement the TransactionPartialSigner interface';
        expect(() => assertIsTransactionPartialSigner(mySigner)).not.toThrow();
        expect(() => assertIsTransactionPartialSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsTransactionPartialSigner({ address: myAddress, signTransactions: 42 })).toThrow(
            expectedMessage
        );
    });
});

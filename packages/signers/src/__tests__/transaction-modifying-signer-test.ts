import { address } from '@solana/addresses';

import {
    assertIsTransactionModifyingSigner,
    isTransactionModifyingSigner,
    TransactionModifyingSigner,
} from '../transaction-modifying-signer';

describe('isTransactionModifyingSigner', () => {
    it('checks whether a given value is a TransactionModifyingSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            modifyAndSignTransactions: async () => [],
        } satisfies TransactionModifyingSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isTransactionModifyingSigner(mySigner)).toBe(true);
        expect(isTransactionModifyingSigner({ address: myAddress })).toBe(false);
        expect(isTransactionModifyingSigner({ address: myAddress, modifyAndSignTransactions: 42 })).toBe(false);
    });
});

describe('assertIsTransactionModifyingSigner', () => {
    it('asserts that a given value is a TransactionModifyingSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            modifyAndSignTransactions: async () => [],
        } satisfies TransactionModifyingSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement the TransactionModifyingSigner interface';
        expect(() => assertIsTransactionModifyingSigner(mySigner)).not.toThrow();
        expect(() => assertIsTransactionModifyingSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsTransactionModifyingSigner({ address: myAddress, modifyAndSignTransactions: 42 })).toThrow(
            expectedMessage
        );
    });
});

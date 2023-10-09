import { address } from '@solana/addresses';

import { assertIsTransactionSigner, isTransactionSigner, TransactionSigner } from '../transaction-signer';

describe('isTransactionSigner', () => {
    it('checks whether a given value is a TransactionSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            signTransaction: async () => [],
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isTransactionSigner(mySigner)).toBe(true);
        expect(isTransactionSigner(myAddress)).toBe(false);
        expect(isTransactionSigner({ address: myAddress })).toBe(false);
        expect(isTransactionSigner({ address: myAddress, signTransaction: 42 })).toBe(false);
    });
});

describe('assertIsTransactionSigner', () => {
    it('asserts that a given value is a TransactionSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            signTransaction: async () => [],
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement the TransactionSigner interface';
        expect(() => assertIsTransactionSigner(mySigner)).not.toThrow();
        expect(() => assertIsTransactionSigner(myAddress)).toThrow(expectedMessage);
        expect(() => assertIsTransactionSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsTransactionSigner({ address: myAddress, signTransaction: 42 })).toThrow(expectedMessage);
    });
});

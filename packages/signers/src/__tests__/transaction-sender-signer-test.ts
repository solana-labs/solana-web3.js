import { address } from '@solana/addresses';

import {
    assertIsTransactionSenderSigner,
    isTransactionSenderSigner,
    TransactionSenderSigner,
} from '../transaction-sender-signer';

describe('isTransactionSenderSigner', () => {
    it('checks whether a given value is a TransactionSenderSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            signAndSendTransaction: async () => [],
        } satisfies TransactionSenderSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isTransactionSenderSigner(mySigner)).toBe(true);
        expect(isTransactionSenderSigner(myAddress)).toBe(false);
        expect(isTransactionSenderSigner({ address: myAddress })).toBe(false);
        expect(isTransactionSenderSigner({ address: myAddress, signAndSendTransaction: 42 })).toBe(false);
    });
});

describe('assertIsTransactionSenderSigner', () => {
    it('asserts that a given value is a TransactionSenderSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            signAndSendTransaction: async () => [],
        } satisfies TransactionSenderSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement the TransactionSenderSigner interface';
        expect(() => assertIsTransactionSenderSigner(mySigner)).not.toThrow();
        expect(() => assertIsTransactionSenderSigner(myAddress)).toThrow(expectedMessage);
        expect(() => assertIsTransactionSenderSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsTransactionSenderSigner({ address: myAddress, signAndSendTransaction: 42 })).toThrow(
            expectedMessage
        );
    });
});

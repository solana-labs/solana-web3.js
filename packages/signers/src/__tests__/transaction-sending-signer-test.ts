import { address } from '@solana/addresses';

import {
    assertIsTransactionSendingSigner,
    isTransactionSendingSigner,
    TransactionSendingSigner,
} from '../transaction-sending-signer';

describe('isTransactionSendingSigner', () => {
    it('checks whether a given value is a TransactionSendingSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            signAndSendTransactions: async () => [],
        } satisfies TransactionSendingSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isTransactionSendingSigner(mySigner)).toBe(true);
        expect(isTransactionSendingSigner({ address: myAddress })).toBe(false);
        expect(isTransactionSendingSigner({ address: myAddress, signAndSendTransactions: 42 })).toBe(false);
    });
});

describe('assertIsTransactionSendingSigner', () => {
    it('asserts that a given value is a TransactionSendingSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            signAndSendTransactions: async () => [],
        } satisfies TransactionSendingSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement the TransactionSendingSigner interface';
        expect(() => assertIsTransactionSendingSigner(mySigner)).not.toThrow();
        expect(() => assertIsTransactionSendingSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsTransactionSendingSigner({ address: myAddress, signAndSendTransactions: 42 })).toThrow(
            expectedMessage
        );
    });
});

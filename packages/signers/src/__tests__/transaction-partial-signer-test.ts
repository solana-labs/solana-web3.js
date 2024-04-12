import { address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_PARTIAL_SIGNER, SolanaError } from '@solana/errors';

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
            signTransactions: () => Promise.resolve([]),
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
            signTransactions: () => Promise.resolve([]),
        } satisfies TransactionPartialSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedError = new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_PARTIAL_SIGNER, {
            address: myAddress,
        });
        expect(() => assertIsTransactionPartialSigner(mySigner)).not.toThrow();
        expect(() => assertIsTransactionPartialSigner({ address: myAddress })).toThrow(expectedError);
        expect(() => assertIsTransactionPartialSigner({ address: myAddress, signTransactions: 42 })).toThrow(
            expectedError,
        );
    });
});

import { address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_MODIFYING_SIGNER, SolanaError } from '@solana/errors';

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
            modifyAndSignTransactions: () => Promise.resolve([]),
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
            modifyAndSignTransactions: () => Promise.resolve([]),
        } satisfies TransactionModifyingSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedError = new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_MODIFYING_SIGNER, {
            address: myAddress,
        });
        expect(() => assertIsTransactionModifyingSigner(mySigner)).not.toThrow();
        expect(() => assertIsTransactionModifyingSigner({ address: myAddress })).toThrow(expectedError);
        expect(() => assertIsTransactionModifyingSigner({ address: myAddress, modifyAndSignTransactions: 42 })).toThrow(
            expectedError,
        );
    });
});

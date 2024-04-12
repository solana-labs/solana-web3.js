import { address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SIGNER, SolanaError } from '@solana/errors';

import { assertIsTransactionSigner, isTransactionSigner, TransactionSigner } from '../transaction-signer';

describe('isTransactionSigner', () => {
    it('checks whether a given value is a TransactionSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const myPartialSigner = {
            address: myAddress,
            signTransactions: () => Promise.resolve([]),
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const myModifyingSigner = {
            address: myAddress,
            modifyAndSignTransactions: () => Promise.resolve([]),
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const mySendingSigner = {
            address: myAddress,
            signAndSendTransactions: () => Promise.resolve([]),
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isTransactionSigner(myPartialSigner)).toBe(true);
        expect(isTransactionSigner(myModifyingSigner)).toBe(true);
        expect(isTransactionSigner(mySendingSigner)).toBe(true);
        expect(isTransactionSigner({ ...myPartialSigner, ...myModifyingSigner })).toBe(true);
        expect(isTransactionSigner({ ...myPartialSigner, ...mySendingSigner })).toBe(true);
        expect(isTransactionSigner({ ...myModifyingSigner, ...mySendingSigner })).toBe(true);
        expect(isTransactionSigner({ ...myPartialSigner, ...myModifyingSigner, ...mySendingSigner })).toBe(true);
        expect(isTransactionSigner({ address: myAddress })).toBe(false);
        expect(isTransactionSigner({ address: myAddress, signTransactions: 42 })).toBe(false);
        expect(isTransactionSigner({ address: myAddress, modifyAndSignTransactions: 42 })).toBe(false);
        expect(isTransactionSigner({ address: myAddress, signAndSendTransactions: 42 })).toBe(false);
    });
});

describe('assertIsTransactionSigner', () => {
    it('asserts that a given value is a TransactionSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const myPartialSigner = {
            address: myAddress,
            signTransactions: () => Promise.resolve([]),
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const myModifyingSigner = {
            address: myAddress,
            modifyAndSignTransactions: () => Promise.resolve([]),
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const mySendingSigner = {
            address: myAddress,
            signAndSendTransactions: () => Promise.resolve([]),
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedError = new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SIGNER, {
            address: myAddress,
        });
        expect(() => assertIsTransactionSigner(myPartialSigner)).not.toThrow();
        expect(() => assertIsTransactionSigner(myModifyingSigner)).not.toThrow();
        expect(() => assertIsTransactionSigner(mySendingSigner)).not.toThrow();
        expect(() => assertIsTransactionSigner({ ...myPartialSigner, ...myModifyingSigner })).not.toThrow();
        expect(() => assertIsTransactionSigner({ ...myPartialSigner, ...mySendingSigner })).not.toThrow();
        expect(() => assertIsTransactionSigner({ ...myModifyingSigner, ...mySendingSigner })).not.toThrow();
        expect(() =>
            assertIsTransactionSigner({ ...myPartialSigner, ...myModifyingSigner, ...mySendingSigner }),
        ).not.toThrow();
        expect(() => assertIsTransactionSigner({ address: myAddress })).toThrow(expectedError);
        expect(() => assertIsTransactionSigner({ address: myAddress, signTransactions: 42 })).toThrow(expectedError);
        expect(() => assertIsTransactionSigner({ address: myAddress, modifyAndSignTransactions: 42 })).toThrow(
            expectedError,
        );
        expect(() => assertIsTransactionSigner({ address: myAddress, signAndSendTransactions: 42 })).toThrow(
            expectedError,
        );
    });
});

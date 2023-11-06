import { address } from '@solana/addresses';

import { assertIsTransactionSigner, isTransactionSigner, TransactionSigner } from '../transaction-signer';

describe('isTransactionSigner', () => {
    it('checks whether a given value is a TransactionSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const myPartialSigner = {
            address: myAddress,
            signTransaction: async () => [],
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const myModifierSigner = {
            address: myAddress,
            modifyAndSignTransaction: async () => [],
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const mySenderSigner = {
            address: myAddress,
            signAndSendTransaction: async () => [],
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isTransactionSigner(myPartialSigner)).toBe(true);
        expect(isTransactionSigner(myModifierSigner)).toBe(true);
        expect(isTransactionSigner(mySenderSigner)).toBe(true);
        expect(isTransactionSigner({ ...myPartialSigner, ...myModifierSigner })).toBe(true);
        expect(isTransactionSigner({ ...myPartialSigner, ...mySenderSigner })).toBe(true);
        expect(isTransactionSigner({ ...myModifierSigner, ...mySenderSigner })).toBe(true);
        expect(isTransactionSigner({ ...myPartialSigner, ...myModifierSigner, ...mySenderSigner })).toBe(true);
        expect(isTransactionSigner({ address: myAddress })).toBe(false);
        expect(isTransactionSigner({ address: myAddress, signTransaction: 42 })).toBe(false);
        expect(isTransactionSigner({ address: myAddress, modifyAndSignTransaction: 42 })).toBe(false);
        expect(isTransactionSigner({ address: myAddress, signAndSendTransaction: 42 })).toBe(false);
    });
});

describe('assertIsTransactionSigner', () => {
    it('asserts that a given value is a TransactionSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const myPartialSigner = {
            address: myAddress,
            signTransaction: async () => [],
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const myModifierSigner = {
            address: myAddress,
            modifyAndSignTransaction: async () => [],
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const mySenderSigner = {
            address: myAddress,
            signAndSendTransaction: async () => [],
        } satisfies TransactionSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement any of the TransactionSigner interfaces';
        expect(() => assertIsTransactionSigner(myPartialSigner)).not.toThrow();
        expect(() => assertIsTransactionSigner(myModifierSigner)).not.toThrow();
        expect(() => assertIsTransactionSigner(mySenderSigner)).not.toThrow();
        expect(() => assertIsTransactionSigner({ ...myPartialSigner, ...myModifierSigner })).not.toThrow();
        expect(() => assertIsTransactionSigner({ ...myPartialSigner, ...mySenderSigner })).not.toThrow();
        expect(() => assertIsTransactionSigner({ ...myModifierSigner, ...mySenderSigner })).not.toThrow();
        expect(() =>
            assertIsTransactionSigner({ ...myPartialSigner, ...myModifierSigner, ...mySenderSigner })
        ).not.toThrow();
        expect(() => assertIsTransactionSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsTransactionSigner({ address: myAddress, signTransaction: 42 })).toThrow(expectedMessage);
        expect(() => assertIsTransactionSigner({ address: myAddress, modifyAndSignTransaction: 42 })).toThrow(
            expectedMessage
        );
        expect(() => assertIsTransactionSigner({ address: myAddress, signAndSendTransaction: 42 })).toThrow(
            expectedMessage
        );
    });
});

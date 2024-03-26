import { address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_SIGNER, SolanaError } from '@solana/errors';

import { assertIsMessageSigner, isMessageSigner, MessageSigner } from '../message-signer';

describe('isMessageSigner', () => {
    it('checks whether a given value is a MessageSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const myPartialSigner = {
            address: myAddress,
            signMessages: () => Promise.resolve([]),
        } satisfies MessageSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const myModifyingSigner = {
            address: myAddress,
            modifyAndSignMessages: () => Promise.resolve([]),
        } satisfies MessageSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isMessageSigner(myPartialSigner)).toBe(true);
        expect(isMessageSigner(myModifyingSigner)).toBe(true);
        expect(isMessageSigner({ ...myPartialSigner, ...myModifyingSigner })).toBe(true);
        expect(isMessageSigner({ address: myAddress })).toBe(false);
        expect(isMessageSigner({ address: myAddress, signMessages: 42 })).toBe(false);
        expect(isMessageSigner({ address: myAddress, modifyAndSignMessages: 42 })).toBe(false);
    });
});

describe('assertIsMessageSigner', () => {
    it('asserts that a given value is a MessageSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const myPartialSigner = {
            address: myAddress,
            signMessages: () => Promise.resolve([]),
        } satisfies MessageSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const myModifyingSigner = {
            address: myAddress,
            modifyAndSignMessages: () => Promise.resolve([]),
        } satisfies MessageSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedError = new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_SIGNER, {
            address: myAddress,
        });
        expect(() => assertIsMessageSigner(myPartialSigner)).not.toThrow();
        expect(() => assertIsMessageSigner(myModifyingSigner)).not.toThrow();
        expect(() => assertIsMessageSigner({ ...myPartialSigner, ...myModifyingSigner })).not.toThrow();
        expect(() => assertIsMessageSigner({ address: myAddress })).toThrow(expectedError);
        expect(() => assertIsMessageSigner({ address: myAddress, signMessages: 42 })).toThrow(expectedError);
        expect(() => assertIsMessageSigner({ address: myAddress, modifyAndSignMessages: 42 })).toThrow(expectedError);
    });
});

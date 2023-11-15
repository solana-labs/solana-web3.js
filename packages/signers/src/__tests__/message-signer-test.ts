import { address } from '@solana/addresses';

import { assertIsMessageSigner, isMessageSigner, MessageSigner } from '../message-signer';

describe('isMessageSigner', () => {
    it('checks whether a given value is a MessageSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const myPartialSigner = {
            address: myAddress,
            signMessages: async () => [],
        } satisfies MessageSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const myModifyingSigner = {
            address: myAddress,
            modifyAndSignMessages: async () => [],
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
            signMessages: async () => [],
        } satisfies MessageSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;
        const myModifyingSigner = {
            address: myAddress,
            modifyAndSignMessages: async () => [],
        } satisfies MessageSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement any of the MessageSigner interfaces';
        expect(() => assertIsMessageSigner(myPartialSigner)).not.toThrow();
        expect(() => assertIsMessageSigner(myModifyingSigner)).not.toThrow();
        expect(() => assertIsMessageSigner({ ...myPartialSigner, ...myModifyingSigner })).not.toThrow();
        expect(() => assertIsMessageSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsMessageSigner({ address: myAddress, signMessages: 42 })).toThrow(expectedMessage);
        expect(() => assertIsMessageSigner({ address: myAddress, modifyAndSignMessages: 42 })).toThrow(expectedMessage);
    });
});

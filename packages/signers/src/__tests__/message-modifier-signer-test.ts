import { address } from '@solana/addresses';

import {
    assertIsMessageModifierSigner,
    isMessageModifierSigner,
    MessageModifierSigner,
} from '../message-modifier-signer';

describe('isMessageModifierSigner', () => {
    it('checks whether a given value is a MessageModifierSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            modifyAndSignMessage: async () => [],
        } satisfies MessageModifierSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isMessageModifierSigner(mySigner)).toBe(true);
        expect(isMessageModifierSigner({ address: myAddress })).toBe(false);
        expect(isMessageModifierSigner({ address: myAddress, modifyAndSignMessage: 42 })).toBe(false);
    });
});

describe('assertIsMessageModifierSigner', () => {
    it('asserts that a given value is a MessageModifierSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            modifyAndSignMessage: async () => [],
        } satisfies MessageModifierSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement the MessageModifierSigner interface';
        expect(() => assertIsMessageModifierSigner(mySigner)).not.toThrow();
        expect(() => assertIsMessageModifierSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsMessageModifierSigner({ address: myAddress, modifyAndSignMessage: 42 })).toThrow(
            expectedMessage
        );
    });
});

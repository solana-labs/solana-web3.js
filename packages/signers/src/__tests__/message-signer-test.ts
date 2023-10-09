import { address } from '@solana/addresses';

import { assertIsMessageSigner, isMessageSigner, MessageSigner } from '../message-signer';

describe('isMessageSigner', () => {
    it('checks whether a given value is a MessageSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            signMessage: async () => [],
        } satisfies MessageSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isMessageSigner(mySigner)).toBe(true);
        expect(isMessageSigner(myAddress)).toBe(false);
        expect(isMessageSigner({ address: myAddress })).toBe(false);
        expect(isMessageSigner({ address: myAddress, signMessage: 42 })).toBe(false);
    });
});

describe('assertIsMessageSigner', () => {
    it('asserts that a given value is a MessageSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            signMessage: async () => [],
        } satisfies MessageSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement the MessageSigner interface';
        expect(() => assertIsMessageSigner(mySigner)).not.toThrow();
        expect(() => assertIsMessageSigner(myAddress)).toThrow(expectedMessage);
        expect(() => assertIsMessageSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsMessageSigner({ address: myAddress, signMessage: 42 })).toThrow(expectedMessage);
    });
});

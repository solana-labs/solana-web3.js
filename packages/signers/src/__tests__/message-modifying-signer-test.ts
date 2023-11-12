import { address } from '@solana/addresses';

import {
    assertIsMessageModifyingSigner,
    isMessageModifyingSigner,
    MessageModifyingSigner,
} from '../message-modifying-signer';

describe('isMessageModifyingSigner', () => {
    it('checks whether a given value is a MessageModifyingSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            modifyAndSignMessages: async () => [],
        } satisfies MessageModifyingSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isMessageModifyingSigner(mySigner)).toBe(true);
        expect(isMessageModifyingSigner({ address: myAddress })).toBe(false);
        expect(isMessageModifyingSigner({ address: myAddress, modifyAndSignMessages: 42 })).toBe(false);
    });
});

describe('assertIsMessageModifyingSigner', () => {
    it('asserts that a given value is a MessageModifyingSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            modifyAndSignMessages: async () => [],
        } satisfies MessageModifyingSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement the MessageModifyingSigner interface';
        expect(() => assertIsMessageModifyingSigner(mySigner)).not.toThrow();
        expect(() => assertIsMessageModifyingSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsMessageModifyingSigner({ address: myAddress, modifyAndSignMessages: 42 })).toThrow(
            expectedMessage
        );
    });
});

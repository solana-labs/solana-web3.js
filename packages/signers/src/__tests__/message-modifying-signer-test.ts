import { address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_MODIFYING_SIGNER, SolanaError } from '@solana/errors';

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
            modifyAndSignMessages: () => Promise.resolve([]),
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
            modifyAndSignMessages: () => Promise.resolve([]),
        } satisfies MessageModifyingSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedError = new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_MODIFYING_SIGNER, {
            address: myAddress,
        });
        expect(() => assertIsMessageModifyingSigner(mySigner)).not.toThrow();
        expect(() => assertIsMessageModifyingSigner({ address: myAddress })).toThrow(expectedError);
        expect(() => assertIsMessageModifyingSigner({ address: myAddress, modifyAndSignMessages: 42 })).toThrow(
            expectedError,
        );
    });
});

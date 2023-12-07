import 'test-matchers/toBeFrozenObject';

import { EncodedAccount } from '../account';
import { decodeAccount } from '../decode-account';
import { MaybeEncodedAccount } from '../maybe-account';
import { getMockDecoder } from './__setup__';

describe('decodeAccount', () => {
    it('decodes the account data of an existing encoded account', () => {
        // Given an encoded account.
        const encodedAccount = <EncodedAccount>{
            address: '1111',
            data: new Uint8Array([1, 2, 3]),
            executable: false,
            lamports: 1_000_000_000n,
            programAddress: '9999',
        };

        // And a mock decoder.
        const decoder = getMockDecoder<{ foo: 42 }>({ foo: 42 });

        // When we decode the encoded account.
        const account = decodeAccount(encodedAccount, decoder);

        // Then we expect the account data to have been decoded.
        expect(account).toStrictEqual({
            address: '1111',
            data: { foo: 42 },
            executable: false,
            lamports: 1_000_000_000n,
            programAddress: '9999',
        });

        // And the decoder to have been called with the encoded account data.
        expect(decoder.decode).toHaveBeenCalledWith(encodedAccount.data);
    });

    it('freezes the decoded account', () => {
        // Given an encoded account.
        const encodedAccount = <EncodedAccount>{
            address: '1111',
            data: new Uint8Array([1, 2, 3]),
            executable: false,
            lamports: 1_000_000_000n,
            programAddress: '9999',
        };

        // And a mock decoder.
        const decoder = getMockDecoder<{ foo: 42 }>({ foo: 42 });

        // When we decode the encoded account.
        const account = decodeAccount(encodedAccount, decoder);

        // Then we expect the decoded account to be frozen.
        expect(account).toBeFrozenObject();
    });

    it('returns non-existing accounts as-is', () => {
        // Given a non-existing encoded account.
        const encodedAccount = <MaybeEncodedAccount>{ address: '1111', exists: false };

        // And a mock decoder.
        const decoder = getMockDecoder<{ foo: 42 }>({ foo: 42 });

        // When we decode the non-existing account.
        const account = decodeAccount(encodedAccount, decoder);

        // Then we expect the decoded account to be the same as the original account.
        expect(account).toBe(encodedAccount);
    });
});

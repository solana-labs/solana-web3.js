import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import { ReadonlyUint8Array } from '@solana/codecs-core';
import {
    SOLANA_ERROR__ACCOUNTS__EXPECTED_ALL_ACCOUNTS_TO_BE_DECODED,
    SOLANA_ERROR__ACCOUNTS__EXPECTED_DECODED_ACCOUNT,
    SolanaError,
} from '@solana/errors';

import { Account, EncodedAccount } from '../account';
import { assertAccountDecoded, assertAccountsDecoded, decodeAccount } from '../decode-account';
import { MaybeAccount, MaybeEncodedAccount } from '../maybe-account';
import { getMockDecoder } from './__setup__';

describe('decodeAccount', () => {
    it('decodes the account data of an existing encoded account', () => {
        // Given an encoded account.
        const encodedAccount = <EncodedAccount>{
            address: '1111',
            data: new Uint8Array([1, 2, 3]) as ReadonlyUint8Array,
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
            data: new Uint8Array([1, 2, 3]) as ReadonlyUint8Array,
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

describe('assertDecodedAccount', () => {
    type MockData = { foo: 42 };

    it('throws if the provided account is encoded', () => {
        // Given an account with Uint8Array data
        const account = <EncodedAccount>{
            address: '1111' as Address,
            data: new Uint8Array([]) as ReadonlyUint8Array,
        };

        // When we assert that the account is decoded
        const fn = () => assertAccountDecoded(account);

        // Then we expect an error to be thrown
        expect(fn).toThrow(
            new SolanaError(SOLANA_ERROR__ACCOUNTS__EXPECTED_DECODED_ACCOUNT, {
                address: account.address,
            }),
        );
    });

    it('does not throw if the provided account is decoded', () => {
        // Given an account with decoded data
        const account = <Account<MockData>>{
            address: '1111' as Address,
            data: { foo: 42 },
        };

        // When we assert that the account is decoded
        const fn = () => assertAccountDecoded(account);

        // Then we expect an error not to be thrown
        expect(fn).not.toThrow();
    });

    it('does not throw if the input account does not exist', () => {
        // Given an account that does not exist
        const account = <MaybeAccount<MockData>>{
            address: '1111' as Address,
            exists: false,
        };

        // When we assert that the account is decoded
        const fn = () => assertAccountDecoded(account);

        // Then we expect an error not to be thrown
        expect(fn).not.toThrow();
    });
});

describe('assertDecodedAccounts', () => {
    type MockData = { foo: 42 };

    it('throws if any of the provided accounts are encoded', () => {
        // Given two encoded accounts and one decoded account
        const accounts = [
            <EncodedAccount>{
                address: '1111' as Address,
                data: new Uint8Array([]) as ReadonlyUint8Array,
            },
            <EncodedAccount>{
                address: '2222' as Address,
                data: new Uint8Array([]) as ReadonlyUint8Array,
            },
            <Account<MockData>>{
                address: '3333' as Address,
                data: { foo: 42 },
            },
        ];

        // When we assert that the accounts are decoded
        const fn = () => assertAccountsDecoded(accounts);

        // Then we expect an error to be thrown
        expect(fn).toThrow(
            new SolanaError(SOLANA_ERROR__ACCOUNTS__EXPECTED_ALL_ACCOUNTS_TO_BE_DECODED, {
                addresses: [accounts[0].address, accounts[1].address],
            }),
        );
    });

    it('does not throw if all of the provided accounts are decoded', () => {
        // Given three decoded accounts
        const accounts = [
            <Account<MockData>>{
                address: '1111' as Address,
                data: { foo: 42 },
            },
            <Account<MockData>>{
                address: '2222' as Address,
                data: { foo: 42 },
            },
            <Account<MockData>>{
                address: '3333' as Address,
                data: { foo: 42 },
            },
        ];

        // When we assert that the accounts are decoded
        const fn = () => assertAccountsDecoded(accounts);

        // Then we expect an error not to be thrown
        expect(fn).not.toThrow();
    });

    it('does not throw if all provided accounts are missing', () => {
        // Given three missing accounts
        const accounts = [
            <MaybeAccount<MockData>>{
                address: '1111' as Address,
                exists: false,
            },
            <MaybeAccount<MockData>>{
                address: '2222' as Address,
                exists: false,
            },
            <MaybeAccount<MockData>>{
                address: '3333' as Address,
                exists: false,
            },
        ];

        // When we assert that the accounts are decoded
        const fn = () => assertAccountsDecoded(accounts);

        // Then we expect an error not to be thrown
        expect(fn).not.toThrow();
    });
});

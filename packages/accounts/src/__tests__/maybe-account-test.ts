import '@solana/test-matchers/toBeFrozenObject';

import {
    SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
    SOLANA_ERROR__ACCOUNTS__ONE_OR_MORE_ACCOUNTS_NOT_FOUND,
    SolanaError,
} from '@solana/errors';

import { assertAccountExists, assertAccountsExist, MaybeEncodedAccount } from '../maybe-account';

describe('assertAccountExists', () => {
    it('fails if the provided MaybeAccount does not exist', () => {
        // Given a non-existing account.
        const maybeAccount = <MaybeEncodedAccount>{ address: '1111', exists: false };

        // When we assert that the account exists.
        const fn = () => assertAccountExists(maybeAccount);

        // Then we expect an error to be thrown.
        expect(fn).toThrow(
            new SolanaError(SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND, {
                address: maybeAccount.address,
            }),
        );
    });
});

describe('assertAccountsExist', () => {
    it('fails if any of the provided MaybeAccounts do not exist', () => {
        // Given two non-existing accounts and an existing account.
        const maybeAccounts = [
            <MaybeEncodedAccount>{ address: '1111', exists: false },
            <MaybeEncodedAccount>{ address: '2222', exists: false },
            <MaybeEncodedAccount>{ address: '3333', exists: true },
        ];

        // When we assert that all the accounts exist.
        const fn = () => assertAccountsExist(maybeAccounts);

        // Then we expect an error to be thrown with the non-existent accounts
        expect(fn).toThrow(
            new SolanaError(SOLANA_ERROR__ACCOUNTS__ONE_OR_MORE_ACCOUNTS_NOT_FOUND, {
                addresses: [maybeAccounts[0].address, maybeAccounts[1].address],
            }),
        );
    });

    it('does not fail if all accounts exist', () => {
        // Given three accounts that all exist
        const maybeAccounts = [
            <MaybeEncodedAccount>{ address: '1111', exists: true },
            <MaybeEncodedAccount>{ address: '2222', exists: true },
            <MaybeEncodedAccount>{ address: '3333', exists: true },
        ];

        // When we assert that all the accounts exist.
        const fn = () => assertAccountsExist(maybeAccounts);

        // Then we expect an error not to be thrown
        expect(fn).not.toThrow();
    });
});

import 'test-matchers/toBeFrozenObject';

import { assertAccountExists, assertAccountsExist, MaybeEncodedAccount } from '../maybe-account';

describe('assertAccountExists', () => {
    it('fails if the provided MaybeAccount does not exist', () => {
        // Given a non-existing account.
        const maybeAccount = <MaybeEncodedAccount>{ address: '1111', exists: false };

        // When we assert that the account exists.
        const fn = () => assertAccountExists(maybeAccount);

        // Then we expect an error to be thrown.
        expect(fn).toThrow(`Expected account [1111] to exist`);
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
        expect(fn).toThrow('Expected accounts [1111, 2222] to exist');
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

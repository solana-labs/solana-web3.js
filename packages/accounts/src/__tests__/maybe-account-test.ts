import 'test-matchers/toBeFrozenObject';

import { assertAccountExists, MaybeEncodedAccount } from '../maybe-account';

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

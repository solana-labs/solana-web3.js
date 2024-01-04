import { Address } from '@solana/addresses';

import { Account } from '../account';
import { assertAccountExists, assertAccountsExist, MaybeAccount } from '../maybe-account';

type MockData = { foo: 42 };

{
    // It narrows a MaybeAccount to an Account
    const account = {} as unknown as MaybeAccount<MockData, '1111'>;
    assertAccountExists(account);
    account satisfies Account<MockData, '1111'>;
}

{
    // It narrows an array of MaybeAccounts to an array of Accounts
    const accounts = [
        {} as unknown as MaybeAccount<MockData, '1111'>,
        {} as unknown as MaybeAccount<MockData, '2222'>,
        {} as unknown as MaybeAccount<MockData, '3333'>,
    ];
    assertAccountsExist(accounts);
    accounts satisfies Account<MockData, Address>[];
}

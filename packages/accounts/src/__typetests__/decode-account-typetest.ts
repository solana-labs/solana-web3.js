import { Address } from '@solana/addresses';
import { Decoder, ReadonlyUint8Array } from '@solana/codecs-core';

import { Account, EncodedAccount } from '../account';
import { assertAccountDecoded, assertAccountsDecoded, decodeAccount } from '../decode-account';
import { MaybeAccount, MaybeEncodedAccount } from '../maybe-account';

type MockData = { foo: 42 };
type MockDataDecoder = Decoder<MockData>;

{
    // It decodes an EncodedAccount into an Account.
    const account = decodeAccount({} as EncodedAccount<'1111'>, {} as MockDataDecoder);
    account satisfies Account<MockData, '1111'>;
}

{
    // It decodes an MaybeEncodedAccount into a MaybeAccount.
    const account = decodeAccount({} as MaybeEncodedAccount<'1111'>, {} as MockDataDecoder);
    account satisfies MaybeAccount<MockData, '1111'>;
    // @ts-expect-error The account should not be of type Account as it may not exist.
    account satisfies Account<MockData, '1111'>;
}

{
    // It narrows an account with data MockData | Uint8Array to MockData
    const account = {} as unknown as Account<MockData | Uint8Array, '1111'>;
    assertAccountDecoded(account);
    account satisfies Account<MockData, '1111'>;
    account.data satisfies MockData;
}

{
    // It narrows a list of accounts with data MockData | Uint8Array to MockData
    const accounts = [
        {} as unknown as Account<MockData | ReadonlyUint8Array, '1111'>,
        {} as unknown as Account<MockData | ReadonlyUint8Array, '2222'>,
        {} as unknown as Account<MockData | ReadonlyUint8Array, '3333'>,
    ];
    assertAccountsDecoded(accounts);
    accounts satisfies Account<MockData, Address>[];
    for (const a of accounts) {
        a.data satisfies MockData;
    }
}

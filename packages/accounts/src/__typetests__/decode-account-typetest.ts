import { Decoder } from '@solana/codecs-core';

import { Account, EncodedAccount } from '../account';
import { decodeAccount } from '../decode-account';
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

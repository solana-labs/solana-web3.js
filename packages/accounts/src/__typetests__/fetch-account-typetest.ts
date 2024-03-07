import type { Address } from '@solana/addresses';
import type { Rpc } from '@solana/rpc-spec';

import {
    fetchEncodedAccount,
    fetchEncodedAccounts,
    fetchJsonParsedAccount,
    fetchJsonParsedAccounts,
} from '../fetch-account';
import type { MaybeAccount, MaybeEncodedAccount } from '../maybe-account';
import type { GetAccountInfoApi, GetMultipleAccountsApi } from '../rpc-api';

const rpc = {} as Rpc<GetAccountInfoApi & GetMultipleAccountsApi>;
const address = '1111' as Address<'1111'>;
const otherAddress = '2222' as Address<'2222'>;

{
    // [fetchEncodedAccount]: returns a MaybeEncodedAccount by default or when using a base64 encoding.
    fetchEncodedAccount(rpc, address) satisfies Promise<MaybeEncodedAccount<'1111'>>;
}

{
    // [fetchJsonParsedAccount]: It returns a MaybeAccount using a provided custom data type or a MaybeEncodedAccount when using a jsonParsed encoding.
    type MockData = { foo: 42 };
    // Unfortunately, TypeScript does not support "Partial type argument inference", which means,
    // as we provide the first type argument for the data type, we have to provide the second
    // one as well for the address since it won't be inferred and will default to `string`.
    fetchJsonParsedAccount<MockData, '1111'>(rpc, address) satisfies Promise<
        MaybeAccount<MockData, '1111'> | MaybeEncodedAccount<'1111'>
    >;
    // @ts-expect-error It does not only satisfy MaybeAccount<MockData>.
    fetchJsonParsedAccount<MockData>(rpc, address) satisfies Promise<MaybeAccount<MockData>>;
    // @ts-expect-error It does not only satisfy MaybeEncodedAccount.
    fetchJsonParsedAccount<MockData>(rpc, address) satisfies Promise<MaybeEncodedAccount>;
}

{
    // [fetchEncodedAccounts]: It matches the returned MaybeEncodedAccounts with the provided addresses.
    fetchEncodedAccounts(rpc, [] as Address[]) satisfies Promise<MaybeEncodedAccount[]>;
    fetchEncodedAccounts(rpc, [address, otherAddress]) satisfies Promise<
        [MaybeEncodedAccount<'1111'>, MaybeEncodedAccount<'2222'>]
    >;
    // @ts-expect-error The first MaybeEncodedAccount does not match the first address.
    fetchEncodedAccounts(rpc, [address, otherAddress]) satisfies Promise<
        [MaybeEncodedAccount<'2222'>, MaybeEncodedAccount<'2222'>]
    >;
    // @ts-expect-error The second MaybeEncodedAccount does not match the second address.
    fetchEncodedAccounts(rpc, [address, otherAddress]) satisfies Promise<
        [MaybeEncodedAccount<'1111'>, MaybeEncodedAccount<'1111'>]
    >;
}

{
    // [fetchJsonParsedAccounts]: It matches the jsonParsed returned types with the provided addresses and data array.
    type MockData = { foo: 42 };
    type OtherMockData = { bar: 42 };
    fetchJsonParsedAccounts<MockData[]>(rpc, [] as Address[]) satisfies Promise<
        (MaybeAccount<MockData> | MaybeEncodedAccount)[]
    >;
    fetchJsonParsedAccounts<MockData[], ['1111', '2222']>(rpc, [address, otherAddress]) satisfies Promise<
        [
            MaybeAccount<MockData, '1111'> | MaybeEncodedAccount<'1111'>,
            MaybeAccount<MockData, '2222'> | MaybeEncodedAccount<'2222'>,
        ]
    >;
    fetchJsonParsedAccounts<[MockData, OtherMockData]>(rpc, [address, otherAddress]) satisfies Promise<
        [MaybeAccount<MockData> | MaybeEncodedAccount, MaybeAccount<OtherMockData> | MaybeEncodedAccount]
    >;
    fetchJsonParsedAccounts<[MockData, OtherMockData], ['1111', '2222']>(rpc, [
        address,
        otherAddress,
    ]) satisfies Promise<
        [
            MaybeAccount<MockData, '1111'> | MaybeEncodedAccount<'1111'>,
            MaybeAccount<OtherMockData, '2222'> | MaybeEncodedAccount<'2222'>,
        ]
    >;
}

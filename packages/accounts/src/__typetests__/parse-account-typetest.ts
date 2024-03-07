import { Address } from '@solana/addresses';

import { Base58RpcAccount, Base64RpcAccount, JsonParsedRpcAccount } from '../__tests__/__setup__';
import { Account, EncodedAccount } from '../account';
import { MaybeAccount, MaybeEncodedAccount } from '../maybe-account';
import { parseBase58RpcAccount, parseBase64RpcAccount, parseJsonRpcAccount } from '../parse-account';

const address = '1111' as Address<'1111'>;
type MyData = { mint: Address; token: Address };

{
    // [parseBase64RpcAccount]: It returns a EncodedAccount when the RPC account is not nullable.
    const account = parseBase64RpcAccount(address, {} as Base64RpcAccount);
    account satisfies EncodedAccount<'1111'>;
}

{
    // [parseBase64RpcAccount]: It returns a MaybeEncodedAccount when the RPC account is nullable.
    const account = parseBase64RpcAccount(address, {} as Base64RpcAccount | null);
    account satisfies MaybeEncodedAccount<'1111'>;
    // @ts-expect-error The account should not be an EncodedAccount as null can be provided.
    account satisfies EncodedAccount;
}

{
    // [parseBase58RpcAccount]: It returns a EncodedAccount when the RPC account is not nullable.
    const account = parseBase58RpcAccount(address, {} as Base58RpcAccount);
    account satisfies EncodedAccount<'1111'>;
}

{
    // [parseBase58RpcAccount]: It returns a MaybeEncodedAccount when the RPC account is nullable.
    const account = parseBase58RpcAccount(address, {} as Base58RpcAccount | null);
    account satisfies MaybeEncodedAccount<'1111'>;
    // @ts-expect-error The account should not be an EncodedAccount as null can be provided.
    account satisfies EncodedAccount;
}

{
    // [parseJsonRpcAccount]: It returns a custom Account when the RPC is a JSON parsed account.
    const account = parseJsonRpcAccount<MyData, '1111'>(address, {} as JsonParsedRpcAccount);
    account satisfies Account<MyData, '1111'>;
}

{
    // [parseJsonRpcAccount]: It returns a MaybeAccount when passing null with a custom Data type.
    const account = parseJsonRpcAccount<MyData, '1111'>(address, null);
    account satisfies MaybeAccount<MyData, '1111'>;
}

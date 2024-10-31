[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/accounts/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/accounts/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/accounts/v/rc

# @solana/accounts

This package contains types and helper methods for representing, fetching and decoding Solana accounts. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

It provides a unified definition of a Solana account regardless of how it was retrieved and can represent both encoded and decoded accounts. It also introduces the concept of a `MaybeAccount` which represents a fetched account that may or may not exist on-chain whilst keeping track of its address in both cases.

Helper functions are provided for fetching, parsing and decoding accounts as well as asserting that an account exists.

```ts
// Fetch.
const myAddress = address('1234..5678');
const myAccount = fetchAccount(rpc, myAddress);
myAccount satisfies MaybeEncodedAccount<'1234..5678'>;

// Assert.
assertAccountExists(myAccount);
myAccount satisfies EncodedAccount<'1234..5678'>;

// Decode.
type MyAccountData = { name: string; age: number };
const myDecoder: Decoder<MyAccountData> = getStructDecoder([
    ['name', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['age', getU32Decoder()],
]);
const myDecodedAccount = decodeAccount(myAccount, myDecoder);
myDecodedAccount satisfies Account<MyAccountData, '1234..5678'>;
```

## Types

### `BaseAccount`

The `BaseAccount` type defines the attributes common to all Solana accounts. Namely, it contains everything stored on-chain except the account data itself.

```ts
const BaseAccount: BaseAccount = {
    executable: false,
    lamports: lamports(1_000_000_000n),
    programAddress: address('1111..1111'),
};
```

This package also exports a `BASE_ACCOUNT_SIZE` constant representing the size of the `BaseAccount` attributes in bytes.

```ts
const myTotalAccountSize = myAccountDataSize + BASE_ACCOUNT_SIZE;
```

### `Account` and `EncodedAccount`

The `Account` type contains all the information relevant to a Solana account. It contains the `BaseAccount` described above as well as the account data and the address of the account.

The account data can be represented as either a `Uint8Array` — meaning the account is encoded — or a custom data type — meaning the account is decoded.

```ts
// Encoded.
const myEncodedAccount: Account<Uint8Array, '1234..5678'> = {
    address: address('1234..5678'),
    data: new Uint8Array([1, 2, 3]),
    executable: false,
    lamports: lamports(1_000_000_000n),
    programAddress: address('1111..1111'),
};

// Decoded.
type MyAccountData = { name: string; age: number };
const myDecodedAccount: Account<MyAccountData, '1234..5678'> = {
    address: address('1234..5678'),
    data: { name: 'Alice', age: 30 },
    executable: false,
    lamports: lamports(1_000_000_000n),
    programAddress: address('1111..1111'),
};
```

The `EncodedAccount` type can also be used to represent an encoded account and is equivalent to an `Account` with a `Uint8Array` account data.

```ts
myEncodedAccount satisfies EncodedAccount<'1234..5678'>;
```

### `MaybeAccount` and `MaybeEncodedAccount`

The `MaybeAccount` type is a union type representing an account that may or may not exist on-chain. When the account exists, it is represented as an `Account` type with an additional `exists` attribute set to `true`. When it does not exist, it is represented by an object containing only the address of the account and an `exists` attribute set to `false`.

```ts
// Account exists.
const myExistingAccount: MaybeAccount<MyAccountData, '1234..5678'> = {
    exists: true,
    address: address('1234..5678'),
    data: { name: 'Alice', age: 30 },
    executable: false,
    lamports: lamports(1_000_000_000n),
    programAddress: address('1111..1111'),
};

// Account does not exist.
const myMissingAccount: MaybeAccount<MyAccountData, '8765..4321'> = {
    exists: false,
    address: address('8765..4321'),
};
```

Similarly to the `Account` type, the `MaybeAccount` type can be used to represent an encoded account by using the `Uint8Array` data type or by using the `MaybeEncodedAccount` helper type.

```ts
// Encoded account exists.
const myExistingAccount: MaybeEncodedAccount<'1234..5678'> = {
    exists: true,
    address: address('1234..5678'),
    data: new Uint8Array([1, 2, 3]),
    // ...
};

// Encoded account does not exist.
const myMissingAccount: MaybeEncodedAccount<'8765..4321'> = {
    exists: false,
    address: address('8765..4321'),
};
```

## Functions

### `assertAccountExists()`

Given a `MaybeAccount`, this function asserts that the account exists and allows it to be used as an `Account` type going forward.

```ts
const myAccount: MaybeEncodedAccount<'1234..5678'>;
assertAccountExists(myAccount);

// Now we can use myAccount as an Account.
myAccount satisfies EncodedAccount<'1234..5678'>;
```

### `assertAccountsExist()`

Given an array of `MaybeAccount`s, this function asserts that all the accounts
exist and allows them to be used as an array of `Account`s going forward.

```ts
const myAccounts: MaybeEncodedAccount<Address>[];
assertAccountsExist(myAccounts);

// Now we can use them as an array of accounts
for (const a of myAccounts) {
    a satisfies EncodedAccount<Address>;
}
```

### `parseBase64RpcAccount()`

This function parses a base64-encoded account provided by the RPC client into an `EncodedAccount` type or a `MaybeEncodedAccount` type if the raw data can be set to `null`.

```ts
const myAddress = address('1234..5678');
const myRpcAccount = await rpc.getAccountInfo(myAddress, { encoding: 'base64' }).send();
const myAccount: MaybeEncodedAccount<'1234..5678'> = parseBase64RpcAccount(myRpcAccount);
```

### `parseBase58RpcAccount()`

This function parses a base58-encoded account provided by the RPC client into an `EncodedAccount` type or a `MaybeEncodedAccount` type if the raw data can be set to `null`.

```ts
const myAddress = address('1234..5678');
const myRpcAccount = await rpc.getAccountInfo(myAddress, { encoding: 'base58' }).send();
const myAccount: MaybeEncodedAccount<'1234..5678'> = parseBase58RpcAccount(myRpcAccount);
```

### `parseJsonRpcAccount()`

This function parses an arbitrary `jsonParsed` account provided by the RPC client into an `Account` type or a `MaybeAccount` type if the raw data can be set to `null`. The expected data type should be explicitly provided as the first type parameter.

```ts
const myAccount: Account<MyData> = parseJsonRpcAccount<MyData>(myJsonRpcAccount);
```

### `fetchEncodedAccount()`

This function fetches a `MaybeEncodedAccount` from the provided RPC client and address. It uses the `getAccountInfo` RPC method under the hood with base64 encoding and an additional configuration object can be provided to customize the behavior of the RPC call.

```ts
const myAddress = address('1234..5678');
const myAccount: MaybeEncodedAccount<'1234..5678'> = await fetchEncodedAccount(rpc, myAddress);

// With custom configuration.
const myAccount: MaybeEncodedAccount<'1234..5678'> = await fetchEncodedAccount(rpc, myAddress, {
    abortSignal: myAbortController.signal,
    commitment: 'confirmed',
});
```

### `fetchEncodedAccounts()`

This function fetches an array of `MaybeEncodedAccount` from the provided RPC client and an array of addresses. It uses the `getMultipleAccounts` RPC method under the hood with base64 encodings and an additional configuration object can be provided to customize the behavior of the RPC call.

```ts
const myAddressA = address('1234..5678');
const myAddressB = address('8765..4321');
const [myAccountA, myAccountB] = await fetchEncodedAccounts(rpc, [myAddressA, myAddressB]);
myAccountA satisfies MaybeEncodedAccount<'1234..5678'>;
myAccountB satisfies MaybeEncodedAccount<'8765..4321'>;

// With custom configuration.
const [myAccountA, myAccountB] = await fetchEncodedAccounts(rpc, [myAddressA, myAddressB], {
    abortSignal: myAbortController.signal,
    commitment: 'confirmed',
});
```

### `fetchJsonParsedAccount()`

This function fetches a `MaybeAccount` from the provided RPC client and address by using `getAccountInfo` under the hood with the `jsonParsed` encoding. It may also return a `MaybeEncodedAccount` if the RPC client does not know how to parse the account at the requested address. In any case, the expected data type should be explicitly provided as the first type parameter.

```ts
type TokenData = { mint: Address; owner: Address };
const myAccount = await fetchJsonParsedAccount<TokenData>(rpc, myAddress);
myAccount satisfies MaybeAccount<TokenData> | MaybeEncodedAccount;

// With custom configuration.
const myAccount = await fetchJsonParsedAccount<TokenData>(rpc, myAddress, {
    abortSignal: myAbortController.signal,
    commitment: 'confirmed',
});
```

### `fetchJsonParsedAccounts()`

Similarly to the `fetchJsonParsedAccount` method, this method fetches an array of `MaybeAccount` from a provided RPC client and an array of addresses. It uses the `getMultipleAccounts` RPC method under the hood with the `jsonParsed` encoding. It may also return a `MaybeEncodedAccount` instead of the expected `MaybeAccount` if the RPC client does not know how to parse some of the requested accounts. In any case, the array of expected data types should be explicitly provided as the first type parameter.

```ts
type TokenData = { mint: Address; owner: Address };
type MintData = { supply: bigint };
const [myAccountA, myAccountB] = await fetchJsonParsedAccounts<[TokenData, MintData]>(rpc, [myAddressA, myAddressB]);
myAccountA satisfies MaybeAccount<TokenData> | MaybeEncodedAccount;
myAccountB satisfies MaybeAccount<MintData> | MaybeEncodedAccount;
```

### `decodeAccount()`

This function transforms an `EncodedAccount` into an `Account` (or a `MaybeEncodedAccount` into a `MaybeAccount`) by decoding the account data using the provided `Decoder` instance.

```ts
type MyAccountData = { name: string; age: number };

const myAccount: EncodedAccount<'1234..5678'>;
const myDecoder: Decoder<MyAccountData> = getStructDecoder([
    ['name', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['age', getU32Decoder()],
]);

const myDecodedAccount = decodeAccount(myAccount, myDecoder);
myDecodedAccount satisfies Account<MyAccountData, '1234..5678'>;
```

### `assertAccountDecoded()`

This function asserts that an account stores decoded data, ie not a Uint8Array. Note that it does not check the shape of the data matches the decoded type, only that it is not a Uint8Array.

```ts
type MyAccountData = { name: string; age: number };

const myAccount: Account<MyAccountData | Uint8Array, '1234..5678'>;
assertAccountDecoded(myAccount);

// now the account data can be used as MyAccountData
account.data satisfies MyAccountData;
```

This is particularly useful for narrowing the result of fetching a JSON parsed account.

```ts
const account: MaybeAccount<MockData | Uint8Array> = await fetchJsonParsedAccount<MockData>(
    rpc,
    '1234..5678' as Address,
);

assertAccountDecoded(account);
// now we have a MaybeAccount<MockData>
account satisfies MaybeAccount<MockData>;
```

### `assertAccountsDecoded`

This function asserts that all input accounts store decoded data, ie not a Uint8Array. As with `assertAccountDecoded` it does not check the shape of the data matches the decoded type, only that it is not a Uint8Array.

```ts
type MyAccountData = { name: string; age: number };

const myAccounts: Account<MyAccountData | Uint8Array, Address>[];
assertAccountsDecoded(myAccounts);

// now the account data can be used as MyAccountData
for (const a of account) {
    account.data satisfies MyAccountData;
}
```

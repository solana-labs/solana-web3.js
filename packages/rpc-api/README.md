[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-api/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-api/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-api/v/rc

# @solana/rpc-api

This package contains types that describe the [methods](https://solana.com/docs/rpc/http) of the Solana JSON RPC API, and utilities for creating a `RpcApi` implementation with sensible defaults. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

Each RPC method is described in terms of a TypeScript type of the following form:

```ts
type ExampleApi = {
    getSomething(address: Address): Something;
};
```

A `RpcApi` that implements `ExampleApi` will ultimately expose its defined methods on any `Rpc` that uses it.

```ts
const rpc: Rpc<ExampleApi> = createExampleRpc(/* ... */);
const something: Something = await rpc.getSomething(address('95DpK3y3GF7U8s1k4EvZ7xqyeCkhsHeZaE97iZpHUGMN')).send();
```

## Types

### `SolanaRpcApi{Devnet|Testnet|Mainnet}`

These types represent the RPC methods available on a specific Solana cluster.

For instance, the test clusters support the `RequestAirdropApi` while mainnet does not.

## Functions

### `createSolanaRpcApi(config)`

Creates a `RpcApi` implementation of the Solana JSON RPC API with some default behaviours.

The default behaviours include:

-   A transform that converts `bigint` inputs to `number` for compatiblity with version 1.0 of the Solana JSON RPC.
-   A transform that calls the config's `onIntegerOverflow` handler whenever a `bigint` input would overflow a JavaScript IEEE 754 number. See [this](https://github.com/solana-labs/solana-web3.js/issues/1116) GitHub issue for more information.
-   A transform that applies a default commitment wherever not specified

#### Arguments

A config object with the following properties:

-   `defaultCommitment`: An optional default `Commitment` value. Given an RPC method that takes `commitment` as a parameter, this value will be used when the caller does not supply one.
-   `onIntegerOverflow(request, keyPath, value): void`: An optional function that will be called whenever a `bigint` input exceeds that which can be expressed using JavaScript numbers. This is used in the default `SolanaRpcApi` to throw an exception rather than to allow truncated values to propagate through a program.

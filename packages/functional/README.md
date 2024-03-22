[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/functional/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/functional/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/functional/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/functional

This package contains generalized functional helpers and functional helpers
specific to Solana application components. It can be used standalone, but it
is also exported as part of the Solana JavaScript SDK
[`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Functions

### `pipe()`

Until the [pipe operator](https://github.com/tc39/proposal-pipeline-operator) becomes part of JavaScript you can use this utility to create pipelines.

```ts
const add = (a, b) => a + b;
const add10 = x => add(x, 10);
const add100 = x => add(x, 100);
const sum = pipe(1, add10, add100);
sum === 111; // true
```

A pipeline is one solution to performing consecutive operations on a value using functions, such as you would when building a transaction.

```ts
const transferTransaction = pipe(
    // The result of the first expression...
    createTransaction({ version: 0 }),
    // ...gets passed as the sole argument to the next function in the pipeline.
    tx => setTransactionFeePayer(myAddress, tx),
    // The return value of that function gets passed to the next...
    tx => setTransactionLifetimeUsingBlockhash(latestBlockhash, tx),
    // ...and so on.
    tx => appendTransactionInstruction(createTransferInstruction(myAddress, toAddress, amountInLamports), tx),
);
```

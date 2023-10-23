[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/transactions/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/transactions/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/transactions/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/transactions

This package contains types and functions for creating transactions. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

Transactions are built one step at a time using the transform functions offered by this package. To make it more ergonmic to apply consecutive transforms to your transactions, consider using a pipelining helper like the one in `@solana/functional`.

```ts
import { pipe } from '@solana/functional';
import {
    appendTransactionInstruction,
    setTransactionFeePayer,
    setTransactionLifetimeUsingBlockhash,
} from '@solana/transactions';

const transferTransaction = pipe(
    createTransaction({ version: 0 }),
    tx => setTransactionFeePayer(myAddress, tx),
    tx => setTransactionLifetimeUsingBlockhash(latestBlockhash, tx),
    tx => appendTransactionInstruction(createTransferInstruction(myAddress, toAddress, amountInLamports), tx)
);
```

## Creating transactions

### Types

#### `TransactionVersion`

As Solana transactions acquire more capabilities their version will advance. This type is a union of all possible transaction versions.

### Functions

#### `createTransaction()`

Given a `TransactionVersion` this method will return an empty transaction having the capabilities of that version.

```ts
import { createTransaction } from '@solana/transactions';

const tx = createTransaction({ version: 0 });
```

## Setting the fee payer

### Types

#### `ITransactionWithFeePayer`

This type represents a transaction for which a fee payer has been declared. A transaction must conform to this type to be landed on the network.

### Functions

#### `setTransactionFeePayer()`

Given a base58-encoded address of a system account, this method will return a new transaction having the same type as the one supplied plus the `ITransactionWithFeePayer` type.

```ts
import { address } from '@solana/addresses';
import { setTransactionFeePayer } from '@solana/transactions';

const myAddress = address('mpngsFd4tmbUfzDYJayjKZwZcaR7aWb2793J6grLsGu');
const txPaidByMe = setTransactionFeePayer(myAddress, tx);
```

## Defining a transaction's lifetime

A signed transaction can be only be landed on the network if certain conditions are met:

-   It includes the hash of a recent block
-   It includes the value of an unused nonce known to the network

These conditions define a transaction's lifetime, after which it can no longer be landed, even if signed.

### Types

#### `ITransactionWithBlockhashLifetime`

This type represents a transaction whose lifetime is defined by the age of the blockhash it includes. Such a transaction can only be landed on the network if the current block height of the network is less than or equal to the value of `ITransactionWithBlockhashLifetime['lifetimeConstraint']['lastValidBlockHeight']`.

#### `Blockhash`

This type represents a string that is particularly known to be the base58-encoded value of a block.

### Functions

#### `setTransactionLifetimeUsingBlockhash()`

Given a blockhash and the last block height at which that blockhash is considered usable to land transactions, this method will return a new transaction having the same type as the one supplied plus the `ITransactionWithBlockhashLifetime` type.

```ts
import { setTransactionLifetimeUsingBlockhash } from '@solana/transactions';

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
const txWithBlockhashLifetime = setTransactionLifetimeUsingBlockhash(latestBlockhash, tx);
```

#### `assertIsBlockhash()`

Client applications primarily deal with blockhashes in the form of base58-encoded strings. Blockhashes returned from the RPC API conform to the type `Blockhash`. You can use a value of that type wherever a blockhash is expected.

From time to time you might acquire a string, that you expect to validate as a blockhash, from an untrusted network API or user input. To assert that such an arbitrary string is a base58-encoded blockhash, use the `assertIsBlockhash` function.

```ts
import { assertIsBlockhash } from '@solana/transactions';

// Imagine a function that asserts whether a user-supplied blockhash is valid or not.
function handleSubmit() {
    // We know only that what the user typed conforms to the `string` type.
    const blockhash: string = blockhashInput.value;
    try {
        // If this type assertion function doesn't throw, then
        // Typescript will upcast `blockhash` to `Blockhash`.
        assertIsBlockhash(blockhash);
        // At this point, `blockhash` is a `Blockhash` that can be used with the RPC.
        const blockhashIsValid = await rpc.isBlockhashValid(blockhash).send();
    } catch (e) {
        // `blockhash` turned out not to be a base58-encoded blockhash
    }
}
```

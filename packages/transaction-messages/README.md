[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/transactions/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/transactions/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/transactions/v/rc

# @solana/transaction-messages

This package contains types and functions for creating transaction messages. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

Transaction messages are built one step at a time using the transform functions offered by this package. To make it more ergonomic to apply consecutive transforms to your transaction messages, consider using a pipelining helper like the one in `@solana/functional`.

```ts
import { pipe } from '@solana/functional';
import {
    appendTransactionMessageInstruction,
    createTransactionMessage,
    setTransactionMessageFeePayer,
    setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/transaction-messages';

const transferTransaction = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayer(myAddress, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    tx => appendTransactionMessageInstruction(createTransferInstruction(myAddress, toAddress, amountInLamports), tx),
);
```

## Creating transaction messages

### Types

#### `TransactionVersion`

As Solana transactions acquire more capabilities their version will advance. This type is a union of all possible transaction versions.

### Functions

#### `createTransactionMessage()`

Given a `TransactionVersion` this method will return an empty transaction having the capabilities of that version.

```ts
import { createTransactionMessage } from '@solana/transaction-messages';

const tx = createTransactionMessage({ version: 0 });
```

## Setting the fee payer

### Types

#### `ITransactionMessageWithFeePayer`

This type represents a transaction message for which a fee payer has been declared. A transaction must conform to this type to be compiled and landed on the network.

### Functions

#### `setTransactionMessageFeePayer()`

Given a base58-encoded address of a system account, this method will return a new transaction message having the same type as the one supplied plus the `ITransactionMessageWithFeePayer` type.

```ts
import { address } from '@solana/addresses';
import { setTransactionMessageFeePayer } from '@solana/transaction-messages';

const myAddress = address('mpngsFd4tmbUfzDYJayjKZwZcaR7aWb2793J6grLsGu');
const txPaidByMe = setTransactionMessageFeePayer(myAddress, tx);
```

## Defining a transaction message's lifetime

A signed transaction can be only be landed on the network if certain conditions are met:

-   It includes the hash of a recent block
-   Or it includes the value of an unused nonce known to the network

These conditions define a transaction's lifetime, after which it can no longer be landed, even if signed. The lifetime must be added to the transaction message before it is compiled to be sent.

### Types

#### `TransactionMessageWithBlockhashLifetime`

This type represents a transaction message whose lifetime is defined by the age of the blockhash it includes. Such a transaction can only be landed on the network if the current block height of the network is less than or equal to the value of `TransactionMessageWithBlockhashLifetime['lifetimeConstraint']['lastValidBlockHeight']`.

#### `TransactionMessageWithDurableNonceLifetime`

This type represents a transaction message whose lifetime is defined by the value of a nonce it includes. Such a transaction can only be landed on the network if the nonce is known to the network and has not already been used to land a different transaction.

#### `Blockhash`

This type represents a string that is particularly known to be the base58-encoded value of a block.

#### `Nonce`

This type represents a string that is particularly known to be the base58-encoded value of a nonce.

### Functions

#### `setTransactionMessageLifetimeUsingBlockhash()`

Given a blockhash and the last block height at which that blockhash is considered usable to land transactions, this method will return a new transaction message having the same type as the one supplied plus the `TransactionMessageWithBlockhashLifetime` type.

```ts
import { setTransactionMessageLifetimeUsingBlockhash } from '@solana/transaction-messages';

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
const txWithBlockhashLifetime = setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx);
```

#### `setTransactionMessageLifetimeUsingDurableNonce()`

Given a nonce, the account where the value of the nonce is stored, and the address of the account authorized to consume that nonce, this method will return a new transaction having the same type as the one supplied plus the `TransactionMessageWithDurableNonceLifetime` type. In particular, this method _prepends_ an instruction to the transaction message designed to consume (or &lsquo;advance&rsquo;) the nonce in the same transaction whose lifetime is defined by it.

```ts
import { setTransactionMessageLifetimeUsingDurableNonce } from '@solana/transactions';

const NONCE_VALUE_OFFSET =
    4 + // version(u32)
    4 + // state(u32)
    32; // nonce authority(pubkey)
// Then comes the nonce value.

const nonceAccountAddress = address('EGtMh4yvXswwHhwVhyPxGrVV2TkLTgUqGodbATEPvojZ');
const nonceAuthorityAddress = address('4KD1Rdrd89NG7XbzW3xsX9Aqnx2EExJvExiNme6g9iAT');
const { value: nonceAccount } = await rpc
    .getAccountInfo(nonceAccountAddress, {
        dataSlice: { length: 32, offset: NONCE_VALUE_OFFSET },
        encoding: 'base58',
    })
    .send();
const nonce =
    // This works because we asked for the exact slice of data representing the nonce
    // value, and furthermore asked for it in `base58` encoding.
    nonceAccount!.data[0] as unknown as Nonce;

const durableNonceTransactionMessage = setTransactionMessageLifetimeUsingDurableNonce(
    { nonce, nonceAccountAddress, nonceAuthorityAddress },
    tx,
);
```

#### `assertIsBlockhash()`

Client applications primarily deal with blockhashes in the form of base58-encoded strings. Blockhashes returned from the RPC API conform to the type `Blockhash`. You can use a value of that type wherever a blockhash is expected.

From time to time you might acquire a string, that you expect to validate as a blockhash, from an untrusted network API or user input. To assert that such an arbitrary string is a base58-encoded blockhash, use the `assertIsBlockhash` function.

```ts
import { assertIsBlockhash } from '@solana/transaction-messages';

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

#### `assertIsDurableNonceTransactionMessage()`

From time to time you might acquire a transaction message that you expect to be a durable nonce transaction, from an untrusted network API or user input. To assert that such an arbitrary transaction is in fact a durable nonce transaction, use the `assertIsDurableNonceTransactionMessage` function.

See [`assertIsBlockhash()`](#assertisblockhash) for an example of how to use an assertion function.

## Adding instructions to a transaction message

### Types

#### `IInstruction`

This type represents an instruction to be issued to a program. Objects that conform to this type have a `programAddress` property that is the base58-encoded address of the program in question.

#### `IInstructionWithAccounts`

This type represents an instruction that specifies a list of accounts that a program may read from, write to, or require be signers of the transaction itself. Objects that conform to this type have an `accounts` property that is an array of `IAccountMeta | IAccountLookupMeta` in the order the instruction requires.

#### `IInstructionWithData`

This type represents an instruction that supplies some data as input to the program. Objects that conform to this type have a `data` property that can be any type of `Uint8Array`.

### Functions

#### `appendTransactionMessageInstruction()`

Given an instruction, this method will return a new transaction message with that instruction having been added to the end of the list of existing instructions.

```ts
import { address } from '@solana/addresses';
import { appendTransactionMessageInstruction } from '@solana/transaction-messages';

const memoTransaction = appendTransactionMessageInstruction(
    {
        data: new TextEncoder().encode('Hello world!'),
        programAddress: address('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
    },
    tx,
);
```

If you'd like to add multiple instructions to a transaction message at once, you may use the `appendTransactionInstructions` function instead which accepts an array of instructions.

#### `prependTransactionMessageInstruction()`

Given an instruction, this method will return a new transaction message with that instruction having been added to the beginning of the list of existing instructions.

If you'd like to prepend multiple instructions to a transaction message at once, you may use the `prependTransactionMessageInstructions` function instead which accepts an array of instructions.

See [`appendTransactionMessageInstruction()`](#appendtransactioninstruction) for an example of how to use this function.

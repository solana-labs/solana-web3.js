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
    tx => appendTransactionInstruction(createTransferInstruction(myAddress, toAddress, amountInLamports), tx),
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

#### `IDurableNonceTransaction`

This type represents a transaction whose lifetime is defined by the value of a nonce it includes. Such a transaction can only be landed on the network if the nonce is known to the network and has not already been used to land a different transaction.

#### `Blockhash`

This type represents a string that is particularly known to be the base58-encoded value of a block.

#### `Nonce`

This type represents a string that is particularly known to be the base58-encoded value of a nonce.

### Functions

#### `setTransactionLifetimeUsingBlockhash()`

Given a blockhash and the last block height at which that blockhash is considered usable to land transactions, this method will return a new transaction having the same type as the one supplied plus the `ITransactionWithBlockhashLifetime` type.

```ts
import { setTransactionLifetimeUsingBlockhash } from '@solana/transactions';

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
const txWithBlockhashLifetime = setTransactionLifetimeUsingBlockhash(latestBlockhash, tx);
```

#### `setTransactionLifetimeUsingDurableNonce()`

Given a nonce, the account where the value of the nonce is stored, and the address of the account authorized to consume that nonce, this method will return a new transaction having the same type as the one supplied plus the `IDurableNonceTransaction` type. In particular, this method _prepends_ an instruction to the transaction designed to consume (or &lsquo;advance&rsquo;) the nonce in the same transaction whose lifetime is defined by it.

```ts
import { setTransactionLifetimeUsingDurableNonce } from '@solana/transactions';

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

const durableNonceTransaction = setTransactionLifetimeUsingDurableNonce(
    { nonce, nonceAccountAddress, nonceAuthorityAddress },
    tx,
);
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

#### `assertIsDurableNonceTransaction()`

From time to time you might acquire a transaction that you expect to be a durable nonce transaction, from an untrusted network API or user input. To assert that such an arbitrary transaction is in fact a durable nonce transaction, use the `assertIsDurableNonceTransaction` function.

See [`assertIsBlockhash()`](#assertisblockhash) for an example of how to use an assertion function.

## Adding instructions to a transaction

### Types

#### `IInstruction`

This type represents an instruction to be issued to a program. Objects that conform to this type have a `programAddress` property that is the base58-encoded address of the program in question.

#### `IInstructionWithAccounts`

This type represents an instruction that specifies a list of accounts that a program may read from, write to, or require be signers of the transaction itself. Objects that conform to this type have an `accounts` property that is an array of `IAccountMeta | IAccountLookupMeta` in the order the instruction requires.

#### `IInstructionWithData`

This type represents an instruction that supplies some data as input to the program. Objects that conform to this type have a `data` property that can be any type of `Uint8Array`.

### Functions

#### `appendTransactionInstruction()`

Given an instruction, this method will return a new transaction with that instruction having been added to the end of the list of existing instructions.

```ts
import { address } from '@solana/addresses';
import { appendTransactionInstruction } from '@solana/transactions';

const memoTransaction = appendTransactionInstruction(
    {
        data: new TextEncoder().encode('Hello world!'),
        programAddress: address('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
    },
    tx,
);
```

If you'd like to add multiple instructions to a transaction at once, you may use the `appendTransactionInstructions` function instead which accepts an array of instructions.

#### `prependTransactionInstruction()`

Given an instruction, this method will return a new transaction with that instruction having been added to the beginning of the list of existing instructions.

If you'd like to prepend multiple instructions to a transaction at once, you may use the `prependTransactionInstructions` function instead which accepts an array of instructions.

See [`appendTransactionInstruction()`](#appendtransactioninstruction) for an example of how to use this function.

## Signing transactions

In order to be landed on the network, a transaction must be signed by all of the private keys belonging to accounts that are required signers of the transaction.

Whether a transaction is ready to be signed or not is enforced for you at the type level. In order to be signable, a transaction must:

-   have a version and a list of zero or more instructions (ie. conform to `BaseTransaction`)
-   have a fee payer set (ie. conform to `ITransactionWithFeePayer`)
-   have a lifetime specified (ie. conform to `ITransactionWithBlockhashLifetime | IDurableNonceTransaction`)

### Types

#### `ITransactionWithSignatures`

This type represents a transaction that is signed by at least one of its required signers. This type of transaction can be serialized to wire format, but is unsuitable for use with functions designed to land transaction on the network.

Expect any function that modifies a transaction (eg. `setTransactionFeePayer`, `appendTransactionInstruction`, et cetera) to delete a transaction's `signatures` property and unset this type.

#### `IFullySignedTransaction`

This type represents a transaction that is signed by all of its required signers. Being fully signed is a prerequisite of functions designed to land transactions on the network.

Expect any function that modifies a transaction (eg. `setTransactionFeePayer`, `appendTransactionInstruction`, et cetera) to delete a transaction's `signatures` property and unset this type.

### Functions

#### `getSignatureFromTransaction()`

Given a transaction signed by its fee payer, this method will return the `Signature` that uniquely identifies it. This string can be used to look up transactions at a later date, for example on a Solana block explorer.

```ts
import { getSignatureFromTransaction } from '@solana/transactions';

const signature = getSignatureFromTransaction(tx);
console.debug(`Inspect this transaction at https://explorer.solana.com/tx/${signature}`);
```

#### `signTransaction()`

Given an array of `CryptoKey` objects which are private keys pertaining to addresses that are required to sign a transaction, this method will return a new signed transaction having the same type as the one supplied plus the `ITransactionWithSignatures` type.

```ts
import { generateKeyPair } from '@solana/keys';
import { signTransaction } from '@solana/transactions';

const signedTransaction = await signTransaction([myPrivateKey], tx);
```

## Serializing transactions

Before sending a transaction to be landed on the network, you must serialize it in a particular way. You can use these types and functions to serialize a signed transaction into a binary format suitable for transit over the wire.

### Types

#### `Base64EncodedWireTransaction`

This type represents the wire format of a transaction as a base64-encoded string.

### Functions

#### `getBase64EncodedWireTransaction()`

Given a signed transaction, this method returns the transaction as a string that conforms to the `Base64EncodedWireTransaction` type.

```ts
import { getBase64EncodedWireTransaction, signTransaction } from '@solana/transactions';

const serializedTransaction = getBase64EncodedWireTransaction(signedTransaction);
const signature = await rpc.sendTransaction(serializedTransaction, { encoding: 'base64' }).send();
```

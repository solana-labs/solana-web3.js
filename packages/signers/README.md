[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/signers/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/signers/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/signers/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/signers

This package provides an abstraction layer over signing messages and transactions in Solana. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

You can think of signers as an abstract way to sign messages and transactions. This could be using a Crypto KeyPair, a wallet adapter in the browser, a Noop signer for testing purposes, or anything you want. Here's an example using a Crypto KeyPair signer:

TODO: Update README with new API.

```ts
import { getStringEncoder } from '@solana/codecs-strings';
import { pipe } from '@solana/functional';
import { generateKeyPairSigner } from '@solana/signers';
import { createTransaction } from '@solana/transactions';

// Generate a key pair signer.
const keyPairSigner = await generateKeyPairSigner();
keyPairSigner.address; // Address;

// Sign one or multiple messages.
const myMessage = getStringEncoder().encode('Hello Signers!');
const [{ signedMessage, signature }] = await keyPairSigner.signMessage([myMessage]);

// Sign one or multiple transactions.
const myTransaction = pipe(
    createTransaction({ version: 0 })
    // Add instructions, fee payer, lifetime, etc.
);
const [mySignedTransaction] = await keyPairSigner.signTransaction([myTransaction]);
```

There are three different types of signers, that can be used in combination when applicable:

-   The `MessageSigner` allows us to sign arbitrary messages.
-   The `TransactionSigner` allows us to sign transactions.
-   The `TransactionSenderSigner` allows us to sign and send transactions in one step and, as such, accommodates wallets that simply cannot sign a transaction without sending it at the same time.

This package also provides the following concrete signer implementations:

-   The `KeyPairSigner` which uses a Crypto KeyPair to sign messages and transactions.
-   The Noop signer which does not sign anything and is mostly useful for testing purposes.

Additionally, this package allows `TransactionSigner` and `TransactionSenderSigner` instances to be stored inside the account meta of an instruction. This allows us to create instructions by passing around signers instead of addresses when applicable which, in turn, allows us to sign an entire transaction automatically without having to scan through its instructions to find the required signers.

In the sections below, we'll go through all the provided signers in more detail before diving into storing signers inside instruction account metas and how to benefit from it.

## Signing messages

### Types

#### `MessageSigner<TAddress>`

Defines a signer that can sign one or multiple messages.

```ts
const myMessageSigner: MessageSigner<'1234..5678'> = {
    address: address('1234..5678'),
    signMessage: async (messages: ReadonlyArray<Uint8Array>): Promise<ReadonlyArray<SignedMessageResponse>> => {
        // My custom signing logic.
    },
};
```

Each signed message returns a `SignedMessageResponse` which contains the requested signature as well as a copy of the message that was actually signed.

```ts
type SignedMessageResponse = {
    signature: Uint8Array;
    signedMessage: Uint8Array;
};
```

Whilst it is likely that the returned `signedMessage` will be the same as the message provided, this is not always the case. For instance, some wallets may need to attach a nonce before or after the provided message before signing it.

### Functions

#### `isMessageSigner()`

A type guard that returns `true` if the provided value is a `MessageSigner`.

```ts
const myAddress = address('1234..5678');
isMessageSigner({ address: myAddress, signMessage: async () => {} }); // ✅ true
isMessageSigner({ address: myAddress }); // ❌ false
```

#### `assertIsMessageSigner()`

A type guard that throws an error if the provided value is not a `MessageSigner`.

```ts
const myAddress = address('1234..5678');
assertIsMessageSigner({ address: myAddress, signMessage: async () => {} }); // ✅ void
assertIsMessageSigner({ address: myAddress }); // ❌ Throws an error.
```

## Signing transactions

### Types

#### `TransactionSigner<TAddress>`

Defines a signer that can sign one or multiple transactions.

```ts
const myTransactionSigner: TransactionSigner<'1234..5678'> = {
    address: address('1234..5678'),
    signTransaction: async <TTransaction extends CompilableTransaction>(
        transactions: ReadonlyArray<TTransaction>
    ): Promise<ReadonlyArray<TTransaction & ITransactionWithSignatures>> => {
        // My custom signing logic.
    },
};
```

For each provided transaction, it returns that same transaction with the requested signatures attached to it.

### Functions

#### `isTransactionSigner()`

A type guard that returns `true` if the provided value is a `TransactionSigner`.

```ts
const myAddress = address('1234..5678');
isTransactionSigner({ address: myAddress, signTransaction: async () => {} }); // ✅ true
isTransactionSigner({ address: myAddress }); // ❌ false
```

#### `assertIsTransactionSigner()`

A type guard that throws an error if the provided value is not a `TransactionSigner`.

```ts
const myAddress = address('1234..5678');
assertIsTransactionSigner({ address: myAddress, signTransaction: async () => {} }); // ✅ void
assertIsTransactionSigner({ address: myAddress }); // ❌ Throws an error.
```

## Signing and sending transactions

### Types

#### `TransactionSenderSigner<TAddress>`

Defines a signer that can sign and send one or multiple transactions.

This interface will sign and send all provided transactions to the blockchain before returning their respective signatures. This is required for PDA wallets and other types of wallets that don't provide an interface for signing transactions without sending them.

```ts
const myTransactionSenderSigner: TransactionSenderSigner<'1234..5678'> = {
    address: address('1234..5678'),
    signAndSendTransaction: async <TTransaction extends CompilableTransaction>(
        transactions: ReadonlyArray<TTransaction>
    ): Promise<ReadonlyArray<TransactionSignature>>; => {
        // My custom signing logic.
    },
};
```

### Functions

#### `isTransactionSenderSigner()`

A type guard that returns `true` if the provided value is a `TransactionSenderSigner`.

```ts
const myAddress = address('1234..5678');
isTransactionSenderSigner({ address: myAddress, signAndSendTransaction: async () => {} }); // ✅ true
isTransactionSenderSigner({ address: myAddress }); // ❌ false
```

#### `assertIsTransactionSenderSigner()`

A type guard that throws an error if the provided value is not a `TransactionSenderSigner`.

```ts
const myAddress = address('1234..5678');
assertIsTransactionSenderSigner({ address: myAddress, signAndSendTransaction: async () => {} }); // ✅ void
assertIsTransactionSenderSigner({ address: myAddress }); // ❌ Throws an error.
```

## Creating and generating KeyPair signers

### Types

#### `KeyPairSigner<TAddress>`

Defines a signer that uses a Crypto KeyPair to sign messages and transactions. It implements both the `MessageSigner` and `TransactionSigner` interfaces and keeps track of the `CryptoKeyPair` instance used to sign messages and transactions.

```ts
import { generateKeyPairSigner } from '@solana/signers';

const myKeyPairSigner = generateKeyPairSigner();
myKeyPairSigner.address; // Address;
myKeyPairSigner.keyPair; // CryptoKeyPair;
const [myMessageResponse] = await myKeyPairSigner.signMessage([myMessage]);
const [mySignedTransaction] = await myKeyPairSigner.signTransaction([myTransaction]);
```

### Functions

#### `createSignerFromKeyPair()`

Creates a `KeyPairSigner` from a provided Crypto KeyPair. The `signMessage` and `signTransaction` functions of the returned signer will use the private key of the provided key pair to sign messages and transactions. Note that both the `signMessage` and `signTransaction` implementations are parallelized, meaning that they will sign all provided messages and transactions in parallel.

```ts
import { generateKeyPair } from '@solana/keys';
import { createSignerFromKeyPair, KeyPairSigner } from '@solana/signers';

const myKeyPair: CryptoKeyPair = await generateKeyPair();
const myKeyPairSigner: KeyPairSigner = await createSignerFromKeyPair(myKeyPair);
```

#### `generateKeyPairSigner()`

A convenience function that generates a new Crypto KeyPair and immediately creates a `KeyPairSigner` from it.

```ts
import { generateKeyPairSigner, KeyPairSigner } from '@solana/signers';

const myKeyPairSigner: KeyPairSigner = await generateKeyPairSigner();
```

#### `isKeyPairSigner()`

A type guard that returns `true` if the provided value is a `KeyPairSigner`.

```ts
const myKeyPairSigner = await generateKeyPairSigner();
isKeyPairSigner(myKeyPairSigner); // ✅ true
isKeyPairSigner({ address: address('1234..5678') }); // ❌ false
```

#### `assertIsKeyPairSigner()`

A type guard that throws an error if the provided value is not a `KeyPairSigner`.

```ts
const myKeyPairSigner = await generateKeyPairSigner();
assertIsKeyPairSigner(myKeyPairSigner); // ✅ void
assertIsKeyPairSigner({ address: address('1234..5678') }); // ❌ Throws an error.
```

## Creating Noop signers

### Functions

#### `createNoopSigner()`

_Coming soon..._

Creates a Noop (No-Operation) signer from a given address. It will return an implementation of both the `MessageSigner` and `TransactionSigner` interfaces that do not sign anything. Namely, signing a transaction will return the transaction as-is and signing a message will provide empty byte arrays as signatures. This is mostly useful for testing purposes.

```ts
import { createNoopSigner } from '@solana/signers';

const myAddress = address('1234..5678');
const myNoopSigner = createNoopSigner(myAddress); // MessageSigner<'1234..5678'> & TransactionSigner<'1234..5678'>
```

## Storing transaction signers inside instruction account metas

### Types

_Coming soon..._

### Functions

_Coming soon..._

[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/transactions/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/transactions/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/transactions/v/rc

# @solana/transactions

This package contains types and functions for compiling, signing and sending transactions. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

Transactions are created by compiling a transaction message. They must then be signed before being submitted to the network.

## Compiling a transaction

### Functions

#### `compileTransaction()`

Given a `TransactionMessage`, this function returns a `Transaction` object. This includes the compiled bytes of the transaction message, and a map of signatures. This map will have a key for each address that is required to sign the transaction. The transaction will not yet have signatures for any of these addresses.

Whether a transaction message is ready to be compiled or not is enforced for you at the type level. In order to be signable, a transaction message must:

-   have a version and a list of zero or more instructions (ie. conform to `BaseTransactionMessage`)
-   have a fee payer set (ie. conform to `ITransactionMessageWithFeePayer`)
-   have a lifetime specified (ie. conform to `TransactionMessageWithBlockhashLifetime | TransactionMessageWithDurableNonceLifetime`)

## Signing transactions

In order to be landed on the network, a transaction must be signed by all of the private keys belonging to accounts that are required signers of the transaction.

### Types

#### `FullySignedTransaction`

This type represents a transaction that is signed by all of its required signers. Being fully signed is a prerequisite of functions designed to land transactions on the network.

### Functions

#### `getSignatureFromTransaction()`

Given a transaction signed by its fee payer, this method will return the `Signature` that uniquely identifies it. This string can be used to look up transactions at a later date, for example on a Solana block explorer.

```ts
import { getSignatureFromTransaction } from '@solana/transactions';

const signature = getSignatureFromTransaction(tx);
console.debug(`Inspect this transaction at https://explorer.solana.com/tx/${signature}`);
```

### `signTransaction()`

Given an array of `CryptoKey` objects which are private keys pertaining to addresses that are required to sign a transaction, this method will return a new signed transaction of type `FullySignedTransaction`. The transaction must have a signature for all required signers after being signed by the input `CryptoKey` objects.

```ts
import { generateKeyPair } from '@solana/keys';
import { signTransaction } from '@solana/transactions';

const signedTransaction = await signTransaction([myPrivateKey], tx);
```

### `partiallySignTransaction()`

This function is the same as `signTransaction()` but does not require the transaction to be signed by all signers. A partially signed transaction cannot be landed on the network, but can be serialized and deserialized.

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

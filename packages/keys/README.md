[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/keys/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/keys/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/keys/v/rc

# @solana/keys

This package contains utilities for validating, generating, and manipulating addresses and key material. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Types

### `Signature`

This type represents a 64-byte Ed25519 signature of some data with a private key, as a base58-encoded string.

### `SignatureBytes`

This type represents a 64-byte Ed25519 signature of some data with a private key.

Whenever you need to verify that a particular signature is, in fact, the one that would have been produced by signing some known bytes using the private key associated with some known public key, use the `verifySignature()` function in this package.

## Functions

### `assertIsSignature()`

From time to time you might acquire a string that you expect to be a base58-encoded signature (eg. of a transaction) from an untrusted network API or user input. To assert that such an arbitrary string is in fact an Ed25519 signature, use the `assertIsSignature` function.

```ts
import { assertIsSignature } from '@solana/keys';

// Imagine a function that asserts whether a user-supplied signature is valid or not.
function handleSubmit() {
    // We know only that what the user typed conforms to the `string` type.
    const signature: string = signatureInput.value;
    try {
        // If this type assertion function doesn't throw, then
        // Typescript will upcast `signature` to `Signature`.
        assertIsSignature(signature);
        // At this point, `signature` is a `Signature` that can be used with the RPC.
        const {
            value: [status],
        } = await rpc.getSignatureStatuses([signature]).send();
    } catch (e) {
        // `signature` turned out not to be a base58-encoded signature
    }
}
```

### `generateKeyPair()`

Generates an Ed25519 public/private key pair for use with other methods in this package that accept `CryptoKey` objects.

```ts
import { generateKeyPair } from '@solana/keys';

const { privateKey, publicKey } = await generateKeyPair();
```

### `createKeyPairFromBytes()`

Given a 64-bytes `Uint8Array` secret key, creates an Ed25519 public/private key pair for use with other methods in this package that accept `CryptoKey` objects.

```ts
import fs from 'fs';
import { createKeyPairFromBytes } from '@solana/keys';

// Get bytes from local keypair file.
const keypairFile = fs.readFileSync('~/.config/solana/id.json');
const keypairBytes = new Uint8Array(JSON.parse(keypairFile.toString()));

// Create a CryptoKeyPair from the bytes.
const { privateKey, publicKey } = await createKeyPairFromBytes(keypairBytes);
```

### `createKeyPairFromPrivateKeyBytes()`

Given a private key represented as a 32-bytes `Uint8Array`, creates an Ed25519 public/private key pair for use with other methods in this package that accept `CryptoKey` objects.

```ts
import { createKeyPairFromPrivateKeyBytes } from '@solana/keys';

const { privateKey, publicKey } = await createKeyPairFromPrivateKeyBytes(new Uint8Array([...]));
```

This can be useful when you have a private key but not the corresponding public key or when you need to derive key pairs from seeds. For instance, the following code snippet derives a key pair from the hash of a message.

```ts
import { getUtf8Encoder } from '@solana/codecs-strings';
import { createKeyPairFromPrivateKeyBytes } from '@solana/keys';

const message = getUtf8Encoder().encode('Hello, World!');
const seed = new Uint8Array(await crypto.subtle.digest('SHA-256', message));

const derivedKeypair = await createKeyPairFromPrivateKeyBytes(seed);
```

### `createPrivateKeyFromBytes()`

Given a private key represented as a 32-bytes `Uint8Array`, creates an Ed25519 private key for use with other methods in this package that accept `CryptoKey` objects.

```ts
import { createPrivateKeyFromBytes } from '@solana/keys';

const privateKey = await createPrivateKeyFromBytes(new Uint8Array([...]));
const extractablePrivateKey = await createPrivateKeyFromBytes(new Uint8Array([...]), true);
```

### `getPublicKeyFromPrivateKey()`

Given an extractable `CryptoKey` private key, gets the corresponding public key as a `CryptoKey`.

```ts
import { createPrivateKeyFromBytes, getPublicKeyFromPrivateKey } from '@solana/keys';

const privateKey = await createPrivateKeyFromBytes(new Uint8Array([...]), true);

const publicKey = await getPublicKeyFromPrivateKey(privateKey);
const extractablePublicKey = await getPublicKeyFromPrivateKey(privateKey, true);
```

### `isSignature()`

This is a type guard that accepts a string as input. It will both return `true` if the string conforms to the `Signature` type and will refine the type for use in your program.

```ts
import { isSignature } from '@solana/keys';

if (isSignature(signature)) {
    // At this point, `signature` has been refined to a
    // `Signature` that can be used with the RPC.
    const {
        value: [status],
    } = await rpc.getSignatureStatuses([signature]).send();
    setSignatureStatus(status);
} else {
    setError(`${signature} is not a transaction signature`);
}
```

### `signBytes()`

Given a private `CryptoKey` and a `Uint8Array` of bytes, this method will return the 64-byte Ed25519 signature of that data as a `Uint8Array`.

```ts
import { signBytes } from '@solana/keys';

const data = new Uint8Array([1, 2, 3]);
const signature = await signBytes(privateKey, data);
```

### `signature()`

This helper combines _asserting_ that a string is an Ed25519 signature with _coercing_ it to the `Signature` type. It's best used with untrusted input.

```ts
import { signature } from '@solana/keys';

const signature = signature(userSuppliedSignature);
const {
    value: [status],
} = await rpc.getSignatureStatuses([signature]).send();
```

### `verifySignature()`

Given a public `CryptoKey`, some `SignatureBytes`, and a `Uint8Array` of data, this method will return `true` if the signature was produced by signing the data using the private key associated with the public key, and `false` otherwise.

```ts
import { verifySignature } from '@solana/keys';

const data = new Uint8Array([1, 2, 3]);
if (!(await verifySignature(publicKey, signature, data))) {
    throw new Error('The data were *not* signed by the private key associated with `publicKey`');
}
```

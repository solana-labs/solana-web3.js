[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/keys/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/keys/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/keys/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/keys

This package contains utilities for validating, generating, and manipulating addresses and key material. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Types

### `Ed25519Signature`

This type represents a 64-byte Ed25519 signature of some data with a private key.

Whenever you need to verify that a particular signature is, in fact, the one that would have been produced by signing some known bytes using the private key associated with some known public key, use the `verifySignature()` function in this package.

## Functions

### `generateKeyPair()`

Generates an Ed25519 public/private key pair for use with other methods in this package that accept `CryptoKey` objects.

```ts
import { generateKeyPair } from '@solana/keys';

const { privateKey, publicKey } = await generateKeyPair();
```

### `signBytes()`

Given a private `CryptoKey` and a `Uint8Array` of bytes, this method will return the 64-byte Ed25519 signature of that data as a `Uint8Array`.

```ts
import { signBytes } from '@solana/keys';

const data = new Uint8Array([1, 2, 3]);
const signature = await signBytes(privateKey, data);
```

### `verifySignature()`

Given a public `CryptoKey`, an `Ed25519Signature`, and a `Uint8Array` of bytes, this method will return `true` if the signature was produced by signing the bytes using the private key associated with the public key, and `false` otherwise.

```ts
import { verifySignature } from '@solana/keys';

const data = new Uint8Array([1, 2, 3]);
if (!(await verifySignature(publicKey, signature, data))) {
    throw new Error('The data were *not* signed by the private key associated with `publicKey`');
}
```

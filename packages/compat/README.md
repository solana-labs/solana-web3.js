[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/compat/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/compat/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/compat/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/compat

This package contains utilities for converting from legacy web3js classes to the new data structures. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Functions

### `fromLegacyPublicKey()`

This can be used to convert a legacy `PublicKey` object to an `Address` type

```ts
import { fromLegacyPublicKey } from '@solana/compat';
const address = fromLegacyPublicKey(new PublicKey('49XBVQsvSW44ULKL9qufS9YqQPbdcps1TQRijx4FQ9sH'));
```

### `fromLegacyKeypair()`

This can be used to convert a legacy `Keypair` object to a native Ed25519 `CryptoKeyPair` object

```ts
import { fromLegacyKeypair } from '@solana/compat';
const { privateKey, publicKey } = await fromLegacyKeypair(Keypair.generate());
```

### `fromVersionedTransaction`

This can be used to convert a legacy `VersionedTransaction` object to a `Transaction` object.

```ts
import { fromVersionedTransaction } from '@solana/compat';

// imagine a function that returns a legacy `VersionedTransaction`
const legacyVersionedTransaction = getMyLegacyVersionedTransaction();
const transaction = fromVersionedTransaction(legacyVersionedTransaction);
```

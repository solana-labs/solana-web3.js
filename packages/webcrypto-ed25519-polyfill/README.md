[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/webcrypto-ed25519-polyfill/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/webcrypto-ed25519-polyfill/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/webcrypto-ed25519-polyfill/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/webcrypto-ed25519-polyfill

This package contains a polyfill that enables Ed25519 key manipulation in environments where it is not yet implemented. It does so by proxying calls to `SubtleCrypto` instance methods to an Ed25519 implementation in userspace.

> [!WARNING]
> Because this package's implementation of Ed25519 key generation exists in userspace, it can't guarantee that the keys you generate with it are non-exportable. Untrusted code running in your JavaScript context may still be able to gain access to and/or exfiltrate secret key material.

> [!NOTE]
> Native `CryptoKeys` can be stored in IndexedDB but the keys created by this polyfill can not. This is because, unlike native `CryptoKeys`, our polyfilled key objects can not implement the [structured clone algorithm](https://www.w3.org/TR/WebCryptoAPI/#cryptokey-interface-clone).

## Usage

Environments that support Ed25519 (see https://github.com/WICG/webcrypto-secure-curves/issues/20) do not require this polyfill.

For all others, simply import this polyfill before use.

```ts
// Importing this will shim methods on `SubtleCrypto`, adding Ed25519 support.
import '@solana/webcrypto-ed25519-polyfill';

// Now you can do this, in environments that do not otherwise support Ed25519.
const keyPair = await crypto.subtle.generateKey('Ed25519', false, ['sign']);
const publicKeyBytes = await crypto.subtle.exportKey('raw', keyPair.publicKey);
const data = new Uint8Array([1, 2, 3]);
const signature = await crypto.subtle.sign('Ed25519', keyPair.privateKey, data);
if (await crypto.subtle.verify('Ed25519', keyPair.publicKey, signature, data)) {
    console.log('Data was signed using the private key associated with this public key');
} else {
    throw new Error('Signature verification error');
}
```

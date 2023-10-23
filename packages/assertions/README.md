[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/assertions/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/assertions/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/assertions/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/assertions

This package contains utilities for asserting that a JavaScript environment supports certain features necessary for the operation of the Solana JavaScript SDK.

## Functions

`assertDigestCapabilityIsAvailable()`

Throws an exception unless `crypto.subtle.digest()` is available in the current JavaScript environment.

`assertKeyExporterIsAvailable()`

Throws an exception unless `crypto.subtle.exportKey()` is available in the current JavaScript environment.

`assertKeyGenerationIsAvailable()`

Throws an exception unless `crypto.subtle.generateKey()` is available in the current JavaScript environment and has support for the `Ed25519` curve.

`assertSigningCapabilityIsAvailable()`

Throws an exception unless `crypto.subtle.sign()` is available in the current JavaScript environment.

`assertVerificationCapabilityIsAvailable()`

Throws an exception unless `crypto.subtle.sign()` is available in the current JavaScript environment.

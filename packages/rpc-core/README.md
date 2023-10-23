[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-core/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-core/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-core/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/rpc-core

This package defines a specification of the [Solana JSON-RPC](https://docs.solana.com/api/http). The inputs and outputs of each RPC method are described in terms of Typescript interfaces. You generally will not need to depend on this package directly, but rather use it as part of the RPC creation functions of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

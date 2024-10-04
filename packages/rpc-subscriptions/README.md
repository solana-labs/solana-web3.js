[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-subscriptions/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-subscriptions/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-subscriptions/v/rc
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/rpc-subscriptions

This package contains types that implement RPC subscriptions as required by the Solana RPC. Additionally, it incorporates some useful defaults that make working with subscriptions easier, more performant, and more reliable. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Functions

### `getRpcSubscriptionsChannelWithJSONSerialization(channel)`

Given an `RpcSubscriptionsChannel`, will return a new channel that parses data published to the `'message'` channel as JSON, and JSON-stringifies messages sent via the `send(message)` method.

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

### `getChannelPoolingChannelCreator(createChannel, { maxSubscriptionsPerChannel, minChannels })`

Given a channel creator, will return a new channel creator with the following behavior.

1. When called, returns an `RpcSubscriptionsChannel`. Adds that channel to a pool.
2. When called again, creates and returns new `RpcSubscriptionChannels` up to the number specified by `minChannels`.
3. When `minChannels` channels have been created, subsequent calls vend whichever existing channel from the pool has the fewest subscribers, or the next one in rotation in the event of a tie.
4. Once all channels carry the number of subscribers specified by the number `maxSubscriptionsPerChannel`, new channels in excess of `minChannel` will be created, returned, and added to the pool.
5. A channel will be destroyed once all of its subscribers' abort signals fire.

### `getRpcSubscriptionsChannelWithJSONSerialization(channel)`

Given an `RpcSubscriptionsChannel`, will return a new channel that parses data published to the `'message'` channel as JSON, and JSON-stringifies messages sent via the `send(message)` method.

[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-subscriptions/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-subscriptions/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-subscriptions/v/rc

# @solana/rpc-subscriptions

This package contains types that implement RPC subscriptions as required by the Solana RPC. Additionally, it incorporates some useful defaults that make working with subscriptions easier, more performant, and more reliable. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Functions

### `createDefaultRpcSubscriptionsChannelCreator(config)`

Creates a function that returns new subscription channels when called.

### `createDefaultSolanaRpcSubscriptionsChannelCreator(config)`

Similar to `createDefaultRpcSubscriptionsChannelCreator` with some Solana-specific defaults. For instance, it safely handles `BigInt` values in JSON messages since Solana RPC servers accept and return integers larger than `Number.MAX_SAFE_INTEGER`.

#### Arguments

A config object with the following properties:

-   `intervalMs`: The number of milliseconds to wait since the last message sent or received over the channel before sending a ping message to keep the channel open.
-   `maxSubscriptionsPerChannel`: The number of subscribers that may share a channel before a new channel must be created (default: 100). It is important that you set this to the maximum number of subscriptions that your RPC provider recommends making over a single connection; the default is set deliberately low, so as to comply with the restrictive limits of the public mainnet RPC node.
-   `minChannels`: The number of channels to create before reusing a channel for a new subscription.
-   `sendBufferHighWatermark`: The number of bytes of data to admint into the `WebSocket` buffer before buffering data on the client. -`url`: The URL of the web socket server. Must use the `ws` or `wss` protocols.

### `getChannelPoolingChannelCreator(createChannel, { maxSubscriptionsPerChannel, minChannels })`

Given a channel creator, will return a new channel creator with the following behavior.

1. When called, returns an `RpcSubscriptionsChannel`. Adds that channel to a pool.
2. When called again, creates and returns new `RpcSubscriptionChannels` up to the number specified by `minChannels`.
3. When `minChannels` channels have been created, subsequent calls vend whichever existing channel from the pool has the fewest subscribers, or the next one in rotation in the event of a tie.
4. Once all channels carry the number of subscribers specified by the number `maxSubscriptionsPerChannel`, new channels in excess of `minChannel` will be created, returned, and added to the pool.
5. A channel will be destroyed once all of its subscribers' abort signals fire.

### `getRpcSubscriptionsChannelWithJSONSerialization(channel)`

Given an `RpcSubscriptionsChannel`, will return a new channel that parses data published to the `'message'` channel as JSON, and JSON-stringifies messages sent via the `send(message)` method.

### `getRpcSubscriptionsChannelWithBigIntJSONSerialization(channel)`

Similarly, to `getRpcSubscriptionsChannelWithJSONSerialization`, this function will stringify and parse JSON message to and from the given `string` channel. However, this function parses any integer value as a `BigInt` in order to safely handle numbers that exceed the JavaScript `Number.MAX_SAFE_INTEGER` value.

### `getRpcSubscriptionsChannelWithAutoping(channel)`

Given an `RpcSubscriptionsChannel`, will return a new channel that sends a ping message to the inner channel if a message has not been sent or received in the last `intervalMs`. In web browsers, this implementation sends no ping when the network is down, and sends a ping immediately upon the network coming back up.

### `getRpcSubscriptionsTransportWithSubscriptionCoalescing(transport)`

Given an `RpcSubscriptionsTransport`, will return a new transport that coalesces identical subscriptions into a single subscription request to the server. The determination of whether a subscription is the same as another is based on the `rpcRequest` returned by its `RpcSubscriptionsPlan`. The subscription will only be aborted once all subscribers abort, or there is an error.

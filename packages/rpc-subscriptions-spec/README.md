[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-subscriptions-spec/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-subscriptions-spec/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-subscriptions-spec/v/rc

# @solana/rpc-subscriptions-spec

This package contains types that describe the implementation of the JSON RPC Subscriptions API, as well as methods to create one. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

This API is designed to be used as follows:

```ts
const rpcSubscriptions =
    // Step 1 - Create an `RpcSubscriptions` instance. This may be stateful.
    createSolanaRpcSubscriptions(mainnet('wss://api.mainnet-beta.solana.com'));
const response = await rpcSubscriptions
    // Step 2 - Call supported methods on it to produce `PendingRpcSubscriptionsRequest` objects.
    .slotNotifications({ commitment: 'confirmed' })
    // Step 3 - Call the `subscribe()` method on those pending requests to trigger them.
    .subscribe({ abortSignal: AbortSignal.timeout(10_000) });
// Step 4 - Iterate over the result.
try {
    for await (const slotNotification of slotNotifications) {
        console.log('Got a slot notification', slotNotification);
    }
} catch (e) {
    console.error('The subscription closed unexpectedly', e);
} finally {
    console.log('We have stopped listening for notifications');
}
```

## Types

### `RpcSubscriptionsChannel<TOutboundMessage, TInboundMessage>`

A channel is a `DataPublisher` that you can subscribe to events of type `RpcSubscriptionChannelEvents<TInboundMessage>`. Additionally, you can use it to send messages of type `TOutboundMessage` back to the remote end by calling the `send(message)` method.

### `RpcSubscriptionsChannelCreator<TOutboundMessage, TInboundMessage>`

A channel creator is a function that accepts an `AbortSignal`, returns a new `RpcSubscriptionsChannel`, and tears down the channel when the abort signal fires.

### `RpcSubscriptionChannelEvents<TInboundMessage>`

Subscription channels publish events on two channel names:

-   `error`: Fires when the channel closes unexpectedly
-   `message`: Fires on every message received from the remote end

## Functions

### `executeRpcPubSubSubscriptionPlan({ channel, responseTransformer, signal, subscribeRequest, unsubscribeMethodName })`

Given a channel, this function executes the particular subscription plan required by the Solana JSON RPC Subscriptions API.

1. Calls the `subscribeRequest` on the remote RPC
2. Waits for a response containing the subscription id
3. Returns a `DataPublisher` that publishes notifications related to that subscriptions id, filtering out all others
4. Calls the `unsubscribeMethodName` on the remote RPC when the abort signal is fired.

### `transformChannelInboundMessages(channel, transform)`

Given a channel with inbound messages of type `T` and a function of type `T => U`, returns a new channel with inbound messages of type `U`. Note that this only affects messages of type `"message"` and thus, does not affect incoming error messages.

For instance, it can be used to parse incoming JSON messages:

```ts
const transformedChannel = transformChannelInboundMessages(channel, JSON.parse);
```

### `transformChannelOutboundMessages(channel, transform)`

Given a channel with outbound messages of type `T` and a function of type `U => T`, returns a new channel with outbound messages of type `U`.

For instance, it can be used to stringify JSON messages before sending them over the wire:

```ts
const transformedChannel = transformChannelOutboundMessages(channel, JSON.stringify);
```

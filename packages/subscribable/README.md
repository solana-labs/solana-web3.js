[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/subscribable/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/subscribable/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/subscribable/v/rc
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/subscribable

This package contains utilities for creating subscription-based event targets. These differ from the `EventTarget` interface in that the method you use to add a listener returns an unsubscribe function. It is primarily intended for internal use &ndash; particularly for those building `RpcSubscriptionChannels` and associated infrastructure.

## Types

### `DataPublisher<TDataByChannelName>`

This type represents an object with an `on` function that you can call to subscribe to certain data over a named channel.

```ts
let dataPublisher: DataPublisher<{ error: SolanaError }>;
dataPublisher.on('data', handleData); // ERROR. `data` is not a known channel name.
dataPublisher.on('error', e => {
    console.error(e);
}); // OK.
```

### `TypedEventEmitter<TEventMap>`

This type allows you to type `addEventListener` and `removeEventListener` so that the call signature of the listener matches the event type given.

```ts
const emitter: TypedEventEmitter<{ message: MessageEvent }> = new WebSocket('wss://api.devnet.solana.com');
emitter.addEventListener('data', handleData); // ERROR. `data` is not a known event type.
emitter.addEventListener('message', message => {
    console.log(message.origin); // OK. `message` is a `MessageEvent` so it has an `origin` property.
});
```

### `TypedEventTarget<TEventMap>`

This type is a superset of `TypedEventEmitter` that allows you to constrain calls to `dispatchEvent`.

```ts
const target: TypedEventTarget<{ candyVended: CustomEvent<{ flavour: string }> }> = new EventTarget();
target.dispatchEvent(new CustomEvent('candyVended', { detail: { flavour: 'raspberry' } })); // OK.
target.dispatchEvent(new CustomEvent('candyVended', { detail: { flavor: 'raspberry' } })); // ERROR. Misspelling in detail.
```

## Functions

### `createAsyncIterableFromDataPublisher({ abortSignal, dataChannelName, dataPublisher, errorChannelName })`

Returns an `AsyncIterable` given a data publisher. The iterable will produce iterators that vend messages published to `dataChannelName` and will throw the first time a message is published to `errorChannelName`. Triggering the abort signal will cause all iterators spawned from this iterator to return once they have published all queued messages.

```ts
const iterable = createAsyncIterableFromDataPublisher({
    abortSignal: AbortSignal.timeout(10_000),
    dataChannelName: 'message',
    dataPublisher,
    errorChannelName: 'error',
});
try {
    for await (const message of iterable) {
        console.log('Got message', message);
    }
} catch (e) {
    console.error('An error was published to the error channel', e);
} finally {
    console.log("It's been 10 seconds; that's enough for now.");
}
```

Things to note:

-   If a message is published over a channel before the `AsyncIterator` attached to it has polled for the next result, the message will be queued in memory.
-   Messages only begin to be queued after the first time an iterator begins to poll. Channel messages published before that time will be dropped.
-   If there are messages in the queue and an error occurs, all queued messages will be vended to the iterator before the error is thrown.
-   If there are messages in the queue and the abort signal fires, all queued messages will be vended to the iterator after which it will return.
-   Any new iterators created after the first error is encountered will reject with that error when polled.

### `getDataPublisherFromEventEmitter(emitter)`

Returns an object with an `on` function that you can call to subscribe to certain data over a named channel. The `on` function returns an unsubscribe function.

```ts
const socketDataPublisher = getDataPublisherFromEventEmitter(new WebSocket('wss://api.devnet.solana.com'));
const unsubscribe = socketDataPublisher.on('message', message => {
    if (JSON.parse(message.data).id === 42) {
        console.log('Got response 42');
        unsubscribe();
    }
});
```

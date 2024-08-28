[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/async/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/async/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/async/v/rc
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/async

This package contains utilities for working with asynchronous values like promises, iterators, and generators.

## Types

### `InterruptibleAsyncIterator<T, TReturn, TNext>`

Represents an `AsyncIterator` that can be interrupted abruptly by calling its `return` function. This type is mostly identical to `AsyncIterator` with one difference. Because interruptible iterators do not wait for the inner iterator's `return` function to resolve, the return value of an interruptible iterator may be `undefined`.

The type of an interruptible iterator's `return` function therefore includes `undefined` in its return type:

```ts
type ReturnFn = (value?: PromiseLike<TReturn> | TReturn) => Promise<
    IteratorResult<
        T,
        // Add in `undefined` here, to cover the interruption case.
        TReturn | undefined
    >
>;
```

## Functions

### `createInterruptibleAsyncIterator(innerIterator)`

Given an `AsyncIterator`, returns an `InterruptibleAsyncIterator`. Interruptible iterators are designed so that any pending iteration of the inner iterator be abruptly interrupted by a call to `return` on the outer iterator. All pending calls to `next` will return `undefined` upon interruption, unconditionally and immediately.

Features:

-   Calling `return` will immediately cause pending calls to `next` or `throw` to resolve
-   Calling `return` will also call `return` on the inner iterator so that it can run cleanup
-   Calling `throw` will delegate to the inner iterator's `throw` if it is defined
-   This iterator will terminate if ever the inner iterator returns an `IteratorReturnResult`
-   This iterator will terminate if the inner iterator's `next` or `throw` method rejects
-   Once terminated, this iterator will no longer forward calls to the inner iterator
-   This iterator will return a clone of the terminal result via `next`, `return`, and `throw`

Interruptible async iterators can be useful when the promises vended by their inner iterator might pend indefinitely. Calling `return` on an interruptible iterator signals to its consumers to return early while still telling the inner iterator that it's time to run cleanup.

```ts
import { createInterruptibleAsyncIterator } from '@solana/async';

const innerIterator = {
    async next() {
        await new Promise(resolve => {
            timerId = setTimeout(resolve, 3000);
        });
        console.log('timer fired');
        return { done: false, value: 123 };
    },
    return() {
        console.log('running cleanup in inner `return`');
        clearTimeout(timerId);
        return Promise.resolve({ done: true, value: undefined } as const);
    },
};
const interruptibleIterator = createInterruptibleAsyncIterator(innerIterator);

interruptibleIterator.next().then(r => console.log('next result', r));
interruptibleIterator.return().then(r => console.log('return result', r));

// LOGS IMMEDIATELY
// running cleanup in inner `return`
// return result { done: true, value: undefined }
// next result { done: true, value: undefined }
// ...never logs 'timer fired'...
```

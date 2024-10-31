[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/promises/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/promises/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/promises/v/rc

# @solana/promises

This package contains helpers for using JavaScript promises.

## Functions

### `getAbortablePromise(promise, abortSignal?)`

Rejects if the `abortSignal` is aborted before the promise settles. Resolves or rejects with the value of the promise otherwise.

```ts
const result = await getAbortablePromise(
    // Resolves or rejects when `fetch` settles.
    fetch('https://example.com/json').then(r => r.json()),
    // ...unless it takes longer than 5 seconds, after which the `AbortSignal` is triggered.
    AbortSignal.timeout(5000),
);
```

### `safeRace(...promises)`

An implementation of `Promise.race` that causes all of the losing promises to settle. This allows them to be released and garbage collected, preventing memory leaks.

Read more here: https://github.com/nodejs/node/issues/17469

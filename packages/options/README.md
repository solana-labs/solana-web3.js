[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/options/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/options/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/options/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/options

This package allows us to manage and serialize Rust-like Option types in JavaScript. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

This package is also part of the [`@solana/codecs` package](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs) which acts as an entry point for all codec packages as well as for their documentation.

## Creating options

In Rust, we define optional values as an `Option<T>` type which can either be `Some(T)` or `None`. This is usually represented as `T | null` in the JavaScript world. The issue with this approach is it doesn't work with nested options. For instance, an `Option<Option<T>>` in Rust would become a `T | null | null` in JavaScript which is equivalent to `T | null`. That means, there is no way for us to represent the `Some(None)` value in JavaScript or any other nested option.

To solve this issue, this library provides an `Option<T>` union type that works very similarly to the Rust `Option<T>` type. It is defined as follows:

```ts
type Option<T> = Some<T> | None;
type Some<T> = { __option: 'Some'; value: T };
type None = { __option: 'None' };
```

To improve the developer experience, helper functions are available to help you create options. The type `T` of the option can either be inferred by TypeScript or explicitly provided.

```ts
// Create an option with a value.
some('Hello World');
some<number | string>(123);

// Create an empty option.
none();
none<number | string>();
```

## Option helpers

This library also provides helper functions to help us identify and manage `Option` types.

For instance, you can use the `isSome` and `isNone` type guards to check whether a given `Option` is of the desired type.

```ts
isSome(some('Hello World')); // true
isSome(none()); // false

isNone(some('Hello World')); // false
isNone(none()); // true
```

If you are given a type `T | null`, you may also use the `wrapNullable` helper function to transform it into an `Option<T>` type.

```ts
wrapNullable('Hello world'); // Some<string>
wrapNullable(null); // None
```

## Unwrapping options

Several helpers are available to help you unwrap your options and access their potential value. For instance, the `unwrapOption` function transforms an `Option<T>` type into `T` if the value exits and `null` otherwise.

```ts
unwrapOption(some('Hello World')); // "Hello World"
unwrapOption(none()); // null
```

If `null` isn’t the value you want to use for `None` options, you may provide a custom fallback function as the second argument. Its return value will be assigned to `None` options.

```ts
unwrapOption(some('Hello World'), () => 'Default'); // "Hello World"
unwrapOption(none(), () => 'Default'); // "Default"
```

Note that this `unwrapOption` function does not recursively unwrap nested options. You may use the `unwrapOptionRecursively` function for that purpose instead.

```ts
unwrapOptionRecursively(some(some(some('Hello World')))); // "Hello World"
unwrapOptionRecursively(some(some(none<string>()))); // null
```

The `unwrapOptionRecursively` function also walks any object and array it encounters and recursively unwraps any option it identifies in its journey without mutating any object or array.

```ts
unwrapOptionRecursively({
    a: 'hello',
    b: none(),
    c: [{ c1: some(42) }, { c2: none() }],
});
// { a: "hello", b: null, c: [{ c1: 42 }, { c2: null }] }
```

The `unwrapOptionRecursively` also accepts a fallback function as a second argument to provide custom values for `None` options.

```ts
unwrapOptionRecursively(
    {
        a: 'hello',
        b: none(),
        c: [{ c1: some(42) }, { c2: none() }],
    },
    () => 'Default',
);
// { a: "hello", b: "Default", c: [{ c1: 42 }, { c2: "Default" }] }
```

## Option codec

The `getOptionCodec` function behaves exactly the same as the [`getNullableCodec`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#nullable-codec) except that it encodes `Option<T>` types instead of `T | null` types.

Namely, it accepts a codec of type `T` and returns a codec of type `Option<T>`. It stores whether or not the item exists as a boolean prefix using a `u8` by default.

```ts
getOptionCodec(getStringCodec()).encode(some('Hi'));
// 0x01020000004869
//   | |       └-- utf8 string content ("Hi").
//   | └-- u32 string prefix (2 characters).
//   └-- 1-byte prefix (Some).

getOptionCodec(getStringCodec()).encode(none());
// 0x00
//   └-- 1-byte prefix (None).
```

You may provide a number codec as the `prefix` option of the `getOptionCodec` function to configure how to store the boolean prefix.

```ts
const u32OptionStringCodec = getOptionCodec(getStringCodec(), {
    prefix: getU32Codec(),
});

u32OptionStringCodec.encode(some('Hi'));
// 0x01000000020000004869
//   └------┘ 4-byte prefix (Some).

u32OptionStringCodec.encode(none());
// 0x00000000
//   └------┘ 4-byte prefix (None).
```

Additionally, if the item is a `FixedSizeCodec`, you may set the `fixed` option to `true` to also make the returned option codec a `FixedSizeCodec`. To do so, it will pad `null` values with zeroes to match the length of existing values.

```ts
const fixedOptionStringCodec = getOptionCodec(
    getStringCodec({ size: 8 }), // Only works with fixed-size items.
    { fixed: true },
);

fixedOptionStringCodec.encode(some('Hi'));
// 0x014869000000000000
//   | └-- 8-byte utf8 string content ("Hi").
//   └-- 1-byte prefix (Some).

fixedOptionStringCodec.encode(none());
// 0x000000000000000000
//   | └-- 8-byte of padding to make a fixed-size codec.
//   └-- 1-byte prefix (None).
```

Separate `getOptionEncoder` and `getOptionDecoder` functions are also available.

```ts
const bytes = getOptionEncoder(getStringEncoder()).encode(some('Hi'));
const value = getOptionDecoder(getStringDecoder()).decode(bytes);
```

To read more about the available codecs and how to use them, check out the documentation of the main [`@solana/codecs` package](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs).

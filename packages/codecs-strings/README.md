[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/codecs-strings/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/codecs-strings/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/codecs-strings/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/codecs-strings

This package contains codecs for strings of different sizes and encodings. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

This package is also part of the [`@solana/codecs` package](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs) which acts as an entry point for all codec packages as well as for their documentation.

## String helper codec

The `getStringCodec` function returns a `Codec<string>` that can be used to encode strings using various encodings and size strategies. It contains the following options:

-   `encoding`: A `VariableSizeCodec<string>` responsible for encoding and decoding a string in a specific way without worrying about its size. Examples are UTF-8, base58, base64, etc. You can see all available encodings below in this documentation.
-   `size`: This option tells the codec how long the string goes on for in the byte array. It can be one of the following three strategies:
    -   `Codec<number>`: When a number codec is provided, that codec will be used to encode and decode a size prefix for that string. This prefix allows us to know when to stop reading the string when decoding a given byte array.
    -   `number`: When a fixed number is provided, a `FixedSizeCodec` of that size will be returned such that exactly that amount of bytes will be used to encode and decode the string.
    -   `"variable"`: When the string `"variable"` is passed as a size, a `VariableSizeCodec` will be returned without any size boundary. That is, when providing a byte array to decode, the entire byte array will be decoded as a string.

When using `getStringCodec` without any options, the default encoding used is UTF-8 and the default size strategy used is a `u32` prefix codec.

```ts
const bytes = getStringCodec().encode('hello');
// 0x0500000068656c6c6f
//   |       └-- The 5 bytes of content.
//   └-- 4-byte prefix telling us to read 5 bytes.

const value = getStringCodec().decode(bytes);
// "hello"
```

We can use the `size` option to provide a different integer codec for the prefix.

```ts
getStringCodec({ size: getU8Codec() }).encode('hello');
// 0x0568656c6c6f
//   | └-- The 5 bytes of content.
//   └-- 1-byte prefix telling us to read 5 bytes.
```

Or to provide a fixed size such that any string longer or smaller than that size will be truncated or padded respectively.

```ts
getStringCodec({ size: 5 }).encode('hello');
// 0x68656c6c6f
//   └-- The exact 5 bytes of content.

getStringCodec({ size: 5 }).encode('hello world');
// 0x68656c6c6f
//   └-- The truncated 5 bytes of content.

getStringCodec({ size: 5 }).encode('hell');
// 0x68656c6c00
//   └-- The padded 5 bytes of content.
```

Or to tell the codec we do not want to create a size boundary for our string.

```ts
getStringCodec({ size: 'variable' }).encode('hello');
// 0x68656c6c6f
//   └-- Any bytes necessary to encode our content.
```

On top of customizing the size, we may provide a custom `encoding` option like so.

```ts
getStringCodec({ encoding: getUtf8Codec() }).encode('hello');
// 0x0500000068656c6c6f (Default encoding).

getStringCodec({ encoding: getBase64Codec() }).encode('hello');
// 0x0300000085e965

getStringCodec({ encoding: getBase58Codec() }).encode('heLLo');
// 0x040000001b6a3070
```

Finally, separate `getStringEncoder` and `getStringDecoder` functions are also available.

```ts
const bytes = getStringEncoder().encode('hello');
const value = getStringDecoder().decode(bytes);
```

## Utf8 codec

The `getUtf8Codec` function encodes and decodes a UTF-8 string to and from a byte array.

```ts
const bytes = getUtf8Codec().encode('hello'); // 0x68656c6c6f
const value = getUtf8Codec().decode(bytes); // "hello"
```

As usual, separate `getUtf8Encoder` and `getUtf8Decoder` functions are also available.

```ts
const bytes = getUtf8Encoder().encode('hello'); // 0x68656c6c6f
const value = getUtf8Decoder().decode(bytes); // "hello"
```

## Base 64 codec

The `getBase64Codec` function encodes and decodes a base-64 string to and from a byte array.

```ts
const bytes = getBase64Codec().encode('hello+world'); // 0x85e965a3ec28ae57
const value = getBase64Codec().decode(bytes); // "hello+world"
```

As usual, separate `getBase64Encoder` and `getBase64Decoder` functions are also available.

```ts
const bytes = getBase64Encoder().encode('hello+world'); // 0x85e965a3ec28ae57
const value = getBase64Decoder().decode(bytes); // "hello+world"
```

## Base 58 codec

The `getBase58Codec` function encodes and decodes a base-58 string to and from a byte array.

```ts
const bytes = getBase58Codec().encode('heLLo'); // 0x1b6a3070
const value = getBase58Codec().decode(bytes); // "heLLo"
```

As usual, separate `getBase58Encoder` and `getBase58Decoder` functions are also available.

```ts
const bytes = getBase58Encoder().encode('heLLo'); // 0x1b6a3070
const value = getBase58Decoder().decode(bytes); // "heLLo"
```

## Base 16 codec

The `getBase16Codec` function encodes and decodes a base-16 string to and from a byte array.

```ts
const bytes = getBase16Codec().encode('deadface'); // 0xdeadface
const value = getBase16Codec().decode(bytes); // "deadface"
```

As usual, separate `getBase16Encoder` and `getBase16Decoder` functions are also available.

```ts
const bytes = getBase16Encoder().encode('deadface'); // 0xdeadface
const value = getBase16Decoder().decode(bytes); // "deadface"
```

## Base 10 codec

The `getBase10Codec` function encodes and decodes a base-10 string to and from a byte array.

```ts
const bytes = getBase10Codec().encode('1024'); // 0x0400
const value = getBase10Codec().decode(bytes); // "1024"
```

As usual, separate `getBase10Encoder` and `getBase10Decoder` functions are also available.

```ts
const bytes = getBase10Encoder().encode('1024'); // 0x0400
const value = getBase10Decoder().decode(bytes); // "1024"
```

## Base X codec

The `getBaseXCodec` accepts a custom `alphabet` of `X` characters and creates a base-X codec using that alphabet. It does so by iteratively dividing by `X` and handling leading zeros.

The base-10 and base-58 codecs use this base-x codec under the hood.

```ts
const alphabet = '0ehlo';
const bytes = getBaseXCodec(alphabet).encode('hello'); // 0x05bd
const value = getBaseXCodec(alphabet).decode(bytes); // "hello"
```

As usual, separate `getBaseXEncoder` and `getBaseXDecoder` functions are also available.

```ts
const bytes = getBaseXEncoder(alphabet).encode('hello'); // 0x05bd
const value = getBaseXDecoder(alphabet).decode(bytes); // "hello"
```

## Re-slicing base X codec

The `getBaseXResliceCodec` also creates a base-x codec but uses a different strategy. It re-slices bytes into custom chunks of bits that are then mapped to a provided `alphabet`. The number of bits per chunk is also provided and should typically be set to `log2(alphabet.length)`.

This is typically used to create codecs whose alphabet’s length is a power of 2 such as base-16 or base-64.

```ts
const bytes = getBaseXResliceCodec('elho', 2).encode('hellolol'); // 0x4aee
const value = getBaseXResliceCodec('elho', 2).decode(bytes); // "hellolol"
```

As usual, separate `getBaseXResliceEncoder` and `getBaseXResliceDecoder` functions are also available.

```ts
const bytes = getBaseXResliceEncoder('elho', 2).encode('hellolol'); // 0x4aee
const value = getBaseXResliceDecoder('elho', 2).decode(bytes); // "hellolol"
```

---

To read more about the available codecs and how to use them, check out the documentation of the main [`@solana/codecs` package](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs).

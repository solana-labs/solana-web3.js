[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/codecs-data-structures/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/codecs-data-structures/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/codecs-data-structures/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/codecs-data-structures

This package contains codecs for various data structures such as arrays, maps, structs, tuples, enums, etc. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

This package is also part of the [`@solana/codecs` package](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs) which acts as an entry point for all codec packages as well as for their documentation.

## Array codec

The `getArrayCodec` function accepts any codec of type `T` and returns a codec of type `Array<T>`. For instance, here’s how we can create a codec for arrays of numbers that each fit in a single byte.

```ts
const bytes = getArrayCodec(getU8Codec()).encode([1, 2, 3]);
const array = getArrayCodec(getU8Codec()).decode(bytes);
```

By default, the size of the array is stored as a `u32` prefix before encoding the items.

```ts
getArrayCodec(getU8Codec()).encode([1, 2, 3]);
// 0x03000000010203
//   |       └-- 3 items of 1 byte each.
//   └-- 4-byte prefix telling us to read 3 items.
```

However, you may use the `size` option to configure this behaviour. It can be one of the following three strategies:

-   `Codec<number>`: When a number codec is provided, that codec will be used to encode and decode the size prefix.
-   `number`: When a number is provided, the codec will expect a fixed number of items in the array. An error will be thrown when trying to encode an array of a different length.
-   `"remainder"`: When the string `"remainder"` is passed as a size, the codec will use the remainder of the bytes to encode/decode its items. This means the size is not stored or known in advance but simply inferred from the rest of the buffer. For instance, if we have an array of `u16` numbers and 10 bytes remaining, we know there are 5 items in this array.

```ts
getArrayCodec(getU8Codec(), { size: getU16Codec() }).encode([1, 2, 3]);
// 0x0300010203
//   |   └-- 3 items of 1 byte each.
//   └-- 2-byte prefix telling us to read 3 items.

getArrayCodec(getU8Codec(), { size: 3 }).encode([1, 2, 3]);
// 0x010203
//   └-- 3 items of 1 byte each. There must always be 3 items in the array.

getArrayCodec(getU8Codec(), { size: 'remainder' }).encode([1, 2, 3]);
// 0x010203
//   └-- 3 items of 1 byte each. The size is inferred from the remainder of the bytes.
```

Separate `getArrayEncoder` and `getArrayDecoder` functions are also available.

```ts
const bytes = getArrayEncoder(getU8Encoder()).encode([1, 2, 3]);
const array = getArrayDecoder(getU8Decoder()).decode(bytes);
```

## Set codec

The `getSetCodec` function accepts any codec of type `T` and returns a codec of type `Set<T>`. For instance, here’s how we can create a codec for sets of numbers that each fit in a single byte.

```ts
const bytes = getSetCodec(getU8Codec()).encode(new Set([1, 2, 3]));
const set = getSetCodec(getU8Codec()).decode(bytes);
```

Just like the array codec, it uses a `u32` size prefix by default but can be configured using the `size` option. [See the array codec](#array-codec) for more details.

```ts
getSetCodec(getU8Codec(), { size: getU16Codec() }).encode(new Set([1, 2, 3]));
getSetCodec(getU8Codec(), { size: 3 }).encode(new Set([1, 2, 3]));
getSetCodec(getU8Codec(), { size: 'remainder' }).encode(new Set([1, 2, 3]));
```

Separate `getSetEncoder` and `getSetDecoder` functions are also available.

```ts
const bytes = getSetEncoder(getU8Encoder()).encode(new Set([1, 2, 3]));
const set = getSetDecoder(getU8Decoder()).decode(bytes);
```

## Map codec

The `getMapCodec` function accepts two codecs of type `K` and `V` and returns a codec of type `Map<K, V>`. For instance, here’s how we can create a codec for maps such that the keys are fixed strings of 8 bytes and the values are `u8` numbers.

```ts
const keyCodec = getStringCodec({ size: 8 });
const valueCodec = getU8Codec();
const bytes = getMapCodec(keyCodec, valueCodec).encode(new Map([['alice', 42]]));
const map = getMapCodec(keyCodec, valueCodec).decode(bytes);
```

Just like the array codec, it uses a `u32` size prefix by default.

```ts
const keyCodec = getStringCodec({ size: 8 });
const valueCodec = getU8Codec();
const myMap = new Map<string, number>();
myMap.set('alice', 42);
myMap.set('bob', 5);

getMapCodec(keyCodec, valueCodec).encode(myMap);
// 0x02000000616c6963650000002a626f62000000000005
//   |       |               | |               └-- 2nd entry value (5).
//   |       |               | └-- 2nd entry key ("bob").
//   |       |               └-- 1st entry value (42).
//   |       └-- 1st entry key ("alice").
//   └-- 4-byte prefix telling us to read 2 map entries.
```

However, it can be configured using the `size` option. [See the `size` option of the array codec](#array-codec) for more details.

```ts
getMapCodec(keyCodec, valueCodec, { size: getU16Codec() }).encode(myMap);
getMapCodec(keyCodec, valueCodec, { size: 3 }).encode(myMap);
getMapCodec(keyCodec, valueCodec, { size: 'remainder' }).encode(myMap);
```

Separate `getMapEncoder` and `getMapDecoder` functions are also available.

```ts
const bytes = getMapEncoder(keyEncoder, valueEncoder).encode(myMap);
const map = getMapDecoder(keyDecoder, valueDecoder).decode(bytes);
```

## Tuple codec

The `getTupleCodec` function accepts any number of codecs — `T`, `U`, `V`, etc. — and returns a tuple codec of type `[T, U, V, …]` such that each item is in the order of the provided codecs.

```ts
const itemCodecs = [getStringCodec(), getU8Codec(), getU64Codec()];
const bytes = getTupleCodec(itemCodecs).encode(['alice', 42, 123]);
const tuple = getTupleCodec(itemCodecs).decode(bytes);
```

Separate `getTupleEncoder` and `getTupleDecoder` functions are also available.

```ts
const bytes = getTupleEncoder(itemEncoders).encode(['alice', 42, 123]);
const tuple = getTupleDecoder(itemDecoders).decode(bytes);
```

## Struct codec

The `getStructCodec` function accepts any number of field codecs and returns a codec for an object containing all these fields. Each provided field is an array such that the first item is the name of the field and the second item is the codec used to encode and decode that field type.

```ts
type Person = { name: string; age: number };
const personCodec: Codec<Person> = getStructCodec([
    ['name', getStringCodec()],
    ['age', getU8Codec()],
]);

const bytes = personCodec.encode({ name: 'alice', age: 42 });
const person = personCodec.decode(bytes);
```

Separate `getStructEncoder` and `getStructDecoder` functions are also available.

```ts
const personEncoder: Encoder<Person> = getStructEncoder([
    ['name', getStringEncoder()],
    ['age', getU8Encoder()],
]);
const personDecoder: Decoder<Person> = getStructDecoder([
    ['name', getStringDecoder()],
    ['age', getU8Decoder()],
]);
const bytes = personEncoder.encode({ name: 'alice', age: 42 });
const person = personDecoder.decode(bytes);
```

## Scalar enum codec

The `getScalarEnumCodec` function accepts a JavaScript enum constructor and returns a codec for encoding and decoding values of that enum.

```ts
enum Direction {
    Left,
    Right,
    Up,
    Down,
}

const bytes = getScalarEnumCodec(Direction).encode(Direction.Left);
const direction = getScalarEnumCodec(Direction).decode(bytes);
```

When encoding a scalar enum, you may pass the value as an enum value, as a number or even as a string by passing the variant’s name.

```ts
enum Direction {
    Left,
    Right,
    Up,
    Down,
}

getScalarEnumCodec(Direction).encode(Direction.Left); // 0x00
getScalarEnumCodec(Direction).encode(Direction.Right); // 0x01
getScalarEnumCodec(Direction).encode(0); // 0x00
getScalarEnumCodec(Direction).encode(1); // 0x01
getScalarEnumCodec(Direction).encode('Left'); // 0x00
getScalarEnumCodec(Direction).encode('Right'); // 0x01
```

As you can see, by default, a `u8` number is being used to store the enum value. However, a number codec may be passed as the `size` option to configure that behaviour.

```ts
const u32DirectionCodec = getScalarEnumCodec(Direction, { size: getU32Codec() });
u32DirectionCodec.encode(Direction.Left); // 0x00000000
u32DirectionCodec.encode(Direction.Right); // 0x01000000
```

Note that if you provide a string enum — e.g. `enum Direction { Left = 'LEFT' }` — to the `getScalarEnumCodec` function, it will only store the index of the variant. However, the string value may be used to encode that index.

```ts
enum Direction {
    Left = 'LEFT',
    Right = 'RIGHT',
    Up = 'UP',
    Down = 'DOWN',
}

getScalarEnumCodec(Direction).encode(Direction.Right); // 0x01
getScalarEnumCodec(Direction).encode('Right' as Direction); // 0x01
getScalarEnumCodec(Direction).encode('RIGHT'); // 0x01
```

Separate `getScalarEnumEncoder` and `getScalarEnumDecoder` functions are also available.

```ts
const bytes = getScalarEnumEncoder(Direction).encode(Direction.Left);
const direction = getScalarEnumDecoder(Direction).decode(bytes);
```

## Data enum codec

In Rust, enums are powerful data types whose variants can be one of the following:

-   An empty variant — e.g. `enum Message { Quit }`.
-   A tuple variant — e.g. `enum Message { Write(String) }`.
-   A struct variant — e.g. `enum Message { Move { x: i32, y: i32 } }`.

Whilst we do not have such powerful enums in JavaScript, we can emulate them in TypeScript using a union of objects such that each object is differentiated by a specific field. **We call this a data enum**.

We use a special field named `__kind` to distinguish between the different variants of a data enum. Additionally, since all variants are objects, we use a `fields` property to wrap the array of tuple variants. Here is an example.

```ts
type Message =
    | { __kind: 'Quit' } // Empty variant.
    | { __kind: 'Write'; fields: [string] } // Tuple variant.
    | { __kind: 'Move'; x: number; y: number }; // Struct variant.
```

The `getDataEnumCodec` function helps us encode and decode these data enums.

It requires the name and codec of each variant as a first argument. Similarly to the struct codec, these are defined as an array of variant tuples where the first item is the name of the variant and the second item is its codec. Since empty variants do not have data to encode, they simply use the unit codec — documented below — which does nothing.

Here is how we can create a data enum codec for our previous example.

```ts
const messageCodec = getDataEnumCodec([
    // Empty variant.
    ['Quit', getUnitCodec()],

    // Tuple variant.
    ['Write', getStructCodec<{ fields: [string] }>([['fields', getTupleCodec([getStringCodec()])]])],

    // Struct variant.
    [
        'Move',
        getStructCodec<{ x: number; y: number }>([
            ['x', getI32Codec()],
            ['y', getI32Codec()],
        ]),
    ],
]);
```

And here’s how we can use such a codec to encode data enums. Notice that by default, they use a `u8` number prefix to distinguish between the different types of variants.

```ts
messageCodec.encode({ __kind: 'Quit' });
// 0x00
//   └-- 1-byte discriminator (Index 0 — the "Quit" variant).

messageCodec.encode({ __kind: 'Write', fields: ['Hi'] });
// 0x01020000004869
//   | |       └-- utf8 string content ("Hi").
//   | └-- u32 string prefix (2 characters).
//   └-- 1-byte discriminator (Index 1 — the "Write" variant).

messageCodec.encode({ __kind: 'Move', x: 5, y: 6 });
// 0x020500000006000000
//   | |       └-- Field y (6).
//   | └-- Field x (5).
//   └-- 1-byte discriminator (Index 2 — the "Move" variant).
```

However, you may provide a number codec as the `size` option of the `getDataEnumCodec` function to customise that behaviour.

```ts
const u32MessageCodec = getDataEnumCodec([...], {
    size: getU32Codec(),
});

u32MessageCodec.encode({ __kind: 'Quit' });
// 0x00000000
//   └------┘ 4-byte discriminator (Index 0).

u32MessageCodec.encode({ __kind: 'Write', fields: ['Hi'] });
// 0x01000000020000004869
//   └------┘ 4-byte discriminator (Index 1).

u32MessageCodec.encode({ __kind: 'Move', x: 5, y: 6 });
// 0x020000000500000006000000
//   └------┘ 4-byte discriminator (Index 2).
```

Separate `getDataEnumEncoder` and `getDataEnumDecoder` functions are also available.

```ts
const bytes = getDataEnumEncoder(variantEncoders).encode({ __kind: 'Quit' });
const message = getDataEnumDecoder(variantDecoders).decode(bytes);
```

## Boolean codec

The `getBooleanCodec` function returns a `Codec<boolean>` that stores the boolean as `0` or `1` using a `u8` number by default.

```ts
const bytes = getBooleanCodec().encode(true); // 0x01
const value = getBooleanCodec().decode(bytes); // true
```

You may configure that behaviour by providing an explicit number codec as the `size` option of the `getBooleanCodec` function. That number codec will then be used to encode and decode the values `0` and `1` accordingly.

```ts
getBooleanCodec({ size: getU16Codec() }).encode(false); // 0x0000
getBooleanCodec({ size: getU16Codec() }).encode(true); // 0x0100

getBooleanCodec({ size: getU32Codec() }).encode(false); // 0x00000000
getBooleanCodec({ size: getU32Codec() }).encode(true); // 0x01000000
```

Separate `getBooleanEncoder` and `getBooleanDecoder` functions are also available.

```ts
const bytes = getBooleanEncoder().encode(true); // 0x01
const value = getBooleanDecoder().decode(bytes); // true
```

## Nullable codec

The `getNullableCodec` function accepts a codec of type `T` and returns a codec of type `T | null`. It stores whether or not the item exists as a boolean prefix using a `u8` by default.

```ts
getNullableCodec(getStringCodec()).encode('Hi');
// 0x01020000004869
//   | |       └-- utf8 string content ("Hi").
//   | └-- u32 string prefix (2 characters).
//   └-- 1-byte prefix (true — The item exists).

getNullableCodec(getStringCodec()).encode(null);
// 0x00
//   └-- 1-byte prefix (false — The item is null).
```

You may provide a number codec as the `prefix` option of the `getNullableCodec` function to configure how to store the boolean prefix.

```ts
const u32NullableStringCodec = getNullableCodec(getStringCodec(), {
    prefix: getU32Codec(),
});

u32NullableStringCodec.encode('Hi');
// 0x01000000020000004869
//   └------┘ 4-byte prefix (true).

u32NullableStringCodec.encode(null);
// 0x00000000
//   └------┘ 4-byte prefix (false).
```

Additionally, if the item is a `FixedSizeCodec`, you may set the `fixed` option to `true` to also make the returned nullable codec a `FixedSizeCodec`. To do so, it will pad `null` values with zeroes to match the length of existing values.

```ts
const fixedNullableStringCodec = getNullableCodec(
    getStringCodec({ size: 8 }), // Only works with fixed-size items.
    { fixed: true },
);

fixedNullableStringCodec.encode('Hi');
// 0x014869000000000000
//   | └-- 8-byte utf8 string content ("Hi").
//   └-- 1-byte prefix (true — The item exists).

fixedNullableStringCodec.encode(null);
// 0x000000000000000000
//   | └-- 8-byte of padding to make a fixed-size codec.
//   └-- 1-byte prefix (false — The item is null).
```

Note that you might be interested in the Rust-like alternative version of nullable codecs, available in [the ￼￼`@solana/options`￼￼ package](https://github.com/solana-labs/solana-web3.js/tree/master/packages/options).

Separate `getNullableEncoder` and `getNullableDecoder` functions are also available.

```ts
const bytes = getNullableEncoder(getStringEncoder()).encode('Hi');
const value = getNullableDecoder(getStringDecoder()).decode(bytes);
```

## Bytes codec

The `getBytesCodec` function returns a `Codec<Uint8Array>` meaning it coverts `Uint8Arrays` to and from… `Uint8Arrays`! Whilst this might seem a bit useless, it can be useful when composed into other codecs. For example, you could use it in a struct codec to say that a particular field should be left unserialised.

```ts
const bytes = getBytesCodec().encode(new Uint8Array([42])); // 0x2a
const value = getBytesCodec().decode(bytes); // 0x2a
```

By default, when decoding a `Uint8Array`, all the remaining bytes will be used. However, the `getBytesCodec` function accepts a `size` option that allows us to configure how many bytes should be included in our decoded `Uint8Array`. It can be one of the following three strategies:

-   `Codec<number>`: When a number codec is provided, that codec will be used to encode and decode a size prefix for that `Uint8Array`. This prefix allows us to know when to stop reading the `Uint8Array` when decoding an arbitrary byte array.
-   `number`: When a fixed number is provided, a `FixedSizeCodec` of that size will be returned such that exactly that amount of bytes will be used to encode and decode the `Uint8Array`.
-   `"variable"`: When the string `"variable"` is passed as a size, a `VariableSizeCodec` will be returned without any size boundary. This is the default behaviour.

```ts
// Default behaviour: variable size.
getBytesCodec().encode(new Uint8Array([42]));
// 0x2a
//   └-- Uint8Array content using any bytes available.

// Custom size: u16 size.
getBytesCodec({ size: getU16Codec() }).encode(new Uint8Array([42]));
// 0x01002a
//   |   └-- Uint8Array content.
//   └-- 2-byte prefix telling us to read 1 bytes

// Custom size: 5 bytes.
getBytesCodec({ size: 5 }).encode(new Uint8Array([42]));
// 0x2a00000000
//   └-- Uint8Array content padded to use exactly 5 bytes.
```

Separate `getBytesEncoder` and `getBytesDecoder` functions are also available.

```ts
const bytes = getBytesEncoder().encode(new Uint8Array([42]));
const value = getBytesDecoder().decode(bytes);
```

## Bit array codec

The `getBitArrayCodec` function returns a codec that encodes and decodes an array of booleans such that each boolean is represented by a single bit. It requires the size of the codec in bytes and an optional `backward` flag that can be used to reverse the order of the bits.

```ts
const booleans = [true, false, true, false, true, false, true, false];

getBitArrayCodec(1).encode(booleans);
// 0xaa or 0b10101010

getBitArrayCodec(1, { backward: true }).encode(booleans);
// 0x55 or 0b01010101
```

Separate `getBitArrayEncoder` and `getBitArrayDecoder` functions are also available.

```ts
const bytes = getBitArrayEncoder(1).encode(booleans);
const decodedBooleans = getBitArrayDecoder(1).decode(bytes);
```

## Unit codec

The `getUnitCodec` function returns a `Codec<void>` that encodes `undefined` into an empty `Uint8Array` and returns `undefined` without consuming any bytes when decoding. This is more of a low-level codec that can be used internally by other codecs. For instance, this is how data enum codecs describe the codecs of empty variants.

```ts
getUnitCodec().encode(undefined); // Empty Uint8Array
getUnitCodec().decode(anyBytes); // undefined
```

Separate `getUnitEncoder` and `getUnitDecoder` functions are also available.

```ts
getUnitEncoder().encode(undefined);
getUnitDecoder().decode(anyBytes);
```

---

To read more about the available codecs and how to use them, check out the documentation of the main [`@solana/codecs` package](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs).

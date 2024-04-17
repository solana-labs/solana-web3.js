---
'@solana/codecs-data-structures': patch
'@solana/errors': patch
---

Added `useValuesAsDiscriminators` option to `getEnumCodec`

When dealing with numerical enums that have explicit values, you may now use the `useValuesAsDiscriminators` option to encode the value of the enum variant instead of its index.

```ts
enum Numbers {
    One,
    Five = 5,
    Six,
    Nine = 9,
}

const codec = getEnumCodec(Numbers, { useValuesAsDiscriminators: true });
codec.encode(Direction.One); // 0x00
codec.encode(Direction.Five); // 0x05
codec.encode(Direction.Six); // 0x06
codec.encode(Direction.Nine); // 0x09
```

Note that when using the `useValuesAsDiscriminators` option on an enum that contains a lexical value, an error will be thrown.

```ts
enum Lexical {
    One,
    Two = 'two',
}
getEnumCodec(Lexical, { useValuesAsDiscriminators: true }); // Throws an error.
```
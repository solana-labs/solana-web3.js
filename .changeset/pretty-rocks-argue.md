---
'@solana/codecs-data-structures': patch
---

Added new `getHiddenPrefixCodec` and `getHiddenSuffixCodec` helpers

These functions allow us to respectively prepend or append a list of hidden `Codec<void>` to a given codec. When encoding, the hidden codecs will be encoded before or after the main codec and the offset will be moved accordingly. When decoding, the hidden codecs will be decoded but only the result of the main codec will be returned. This is particularly helpful when creating data structures that include constant values that should not be included in the final type.

```ts
const codec: Codec<number> = getHiddenPrefixCodec(getU16Codec(), [
    getConstantCodec(new Uint8Array([1, 2, 3])),
    getConstantCodec(new Uint8Array([4, 5, 6])),
]);

codec.encode(42);
// 0x0102030405062a00
//   |     |     └-- Our main u16 codec (value = 42).
//   |     └-- Our second hidden prefix codec.
//   └-- Our first hidden prefix codec.

codec.decode(new Uint8Array([1, 2, 3, 4, 5, 6, 42, 0])); // 42
```
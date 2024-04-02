---
'@solana/codecs-data-structures': patch
'@solana/transactions': patch
'@solana/options': patch
---

Removed the size option of `getBytesCodec`

The `getBytesCodec` function now always returns a `VariableSizeCodec` that uses as many bytes as necessary to encode and/or decode byte arrays. In order to fix or prefix the size of a `getBytesCodec`, you may now use the `fixCodecSize` or `prefixCodecSide` accordingly. Here are some examples:

```ts
// Before.
getBytesCodec(); // Variable.
getBytesCodec({ size: 5 }); // Fixed.
getBytesCodec({ size: getU16Codec() }); // Prefixed.

// After.
getBytesCodec(); // Variable.
fixCodecSize(getBytesCodec(), 5); // Fixed.
addCodecSizePrefix(getBytesCodec(), getU16Codec()); // Prefixed.
```

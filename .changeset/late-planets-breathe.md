---
'@solana/codecs-data-structures': patch
'@solana/codecs-strings': patch
'@solana/transactions': patch
'@solana/addresses': patch
'@solana/rpc-types': patch
---

Removed `getStringCodec` in favour of `fixCodecSize` and `addCodecSizePrefix`

The `getStringCodec` function now always returns a `VariableSizeCodec` that uses as many bytes as necessary to encode and/or decode strings. In order to fix or prefix the size of a `getStringCodec`, you may now use the `fixCodecSize` or `prefixCodecSide` accordingly. Here are some examples:

```ts
// Before.
getStringCodec({ size: 'variable' }); // Variable.
getStringCodec({ encoding: getUtf8Codec(), size: 'variable' }); // Variable (equivalent).
getStringCodec({ size: 5 }); // Fixed.
getStringCodec({ encoding: getUtf8Codec(), size: 5 }); // Fixed (equivalent).
getStringCodec(); // Prefixed.
getStringCodec({ encoding: getUtf8Codec(), size: getU32Codec() }); // Prefixed (equivalent).

// After.
getUtf8Codec(); // Variable.
fixCodecSize(getUtf8Codec(), 5); // Fixed.
addCodecSizePrefix(getUtf8Codec(), getU32Codec()); // Prefixed.
```

---
'@solana/codecs-data-structures': patch
'@solana/options': patch
'@solana/errors': patch
---

Added new `getZeroableNullableCodec` and `getZeroableOptionCodec` functions

These functions rely on a zero value to represent `None` or `null` values as opposed to using a boolean prefix.

```ts
const codec = getZeroableNullableCodec(getU16Codec());
codec.encode(42); // 0x2a00
codec.encode(null); // 0x0000
codec.decode(new Uint8Array([42, 0])); // 42
codec.encode(new Uint8Array([0, 0])); // null
```

Both functions can also be provided with a custom definition of the zero value using the `zeroValue` option.

```ts
const codec = getZeroableNullableCodec(getU16Codec(), {
    zeroValue: new Uint8Array([255, 255]),
});
codec.encode(42); // 0x2a00
codec.encode(null); // 0xfffff
codec.encode(new Uint8Array([0, 0])); // 0
codec.decode(new Uint8Array([42, 0])); // 42
codec.decode(new Uint8Array([255, 255])); // null
```

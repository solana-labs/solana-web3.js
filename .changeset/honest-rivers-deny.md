---
'@solana/codecs-data-structures': patch
'@solana/codecs-core': patch
'@solana/errors': patch
---

Added new `containsBytes` and `getConstantCodec` helpers

The `containsBytes` helper checks if a `Uint8Array` contains another `Uint8Array` at a given offset.

```ts
containsBytes(new Uint8Array([1, 2, 3, 4]), new Uint8Array([2, 3]), 1); // true
containsBytes(new Uint8Array([1, 2, 3, 4]), new Uint8Array([2, 3]), 2); // false
```

The `getConstantCodec` function accepts any `Uint8Array` and returns a `Codec<void>`. When encoding, it will set the provided `Uint8Array` as-is. When decoding, it will assert that the next bytes contain the provided `Uint8Array` and move the offset forward.

```ts
const codec = getConstantCodec(new Uint8Array([1, 2, 3]));

codec.encode(undefined); // 0x010203
codec.decode(new Uint8Array([1, 2, 3])); // undefined
codec.decode(new Uint8Array([1, 2, 4])); // Throws an error.
```
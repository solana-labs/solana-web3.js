---
'@solana/codecs-data-structures': patch
'@solana/errors': patch
---

Added a new `getUnionCodec` helper that can be used to encode/decode any TypeScript union.

```ts
const codec: Codec<number | boolean> = getUnionCodec(
    [getU16Codec(), getBooleanCodec()],
    value => (typeof value === 'number' ? 0 : 1),
    (bytes, offset) => (bytes.slice(offset).length > 1 ? 0 : 1),
);

codec.encode(42); // 0x2a00
codec.encode(true); // 0x01
```

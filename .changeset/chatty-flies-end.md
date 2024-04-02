---
'@solana/codecs-data-structures': patch
'@solana/codecs-strings': patch
'@solana/codecs-core': patch
---

Added a new `prefixCodecSize` primitive

```ts
const codec = prefixCodecSize(getBase58Codec(), getU32Codec());

codec.encode('hello world');
// 0x0b00000068656c6c6f20776f726c64
//   |       └-- Our encoded base-58 string.
//   └-- Our encoded u32 size prefix.
```

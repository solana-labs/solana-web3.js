---
'@solana/codecs-data-structures': patch
'@solana/errors': patch
---

Added a new `getLiteralUnionCodec`

```ts
const codec = getLiteralUnionCodec(['left', 'right', 'up', 'down']);
// ^? FixedSizeCodec<"left" | "right" | "up" | "down">

const bytes = codec.encode('left'); // 0x00
const value = codec.decode(bytes); // 'left'
```
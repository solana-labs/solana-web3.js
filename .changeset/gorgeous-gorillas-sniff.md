---
'@solana/codecs-core': patch
'@solana/errors': patch
---

Added new `addCodecSentinel` primitive

The `addCodecSentinel` function provides a new way of delimiting the size of a codec. It allows us to add a sentinel to the end of the encoded data and to read until that sentinel is found when decoding. It accepts any codec and a `Uint8Array` sentinel responsible for delimiting the encoded data.

```ts
const codec = addCodecSentinel(getUtf8Codec(), new Uint8Array([255, 255]));
codec.encode('hello');
// 0x68656c6c6fffff
//   |        └-- Our sentinel.
//   └-- Our encoded string.
```
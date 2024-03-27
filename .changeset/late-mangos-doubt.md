---
'@solana/codecs-data-structures': patch
---

DataEnum codecs can now use numbers or symbols as discriminator values

```ts
const codec = getDataEnumCodec([
  [1, getStructCodec([[['one', u32]]])]
  [2, getStructCodec([[['two', u32]]])]
]);

codec.encode({ __kind: 1, one: 42 });
codec.encode({ __kind: 2, two: 42 });
```

This means you can also use enum values as discriminators, like so:

```ts
enum Event { Click, KeyPress }
const codec = getDataEnumCodec([
  [Event.Click, getStructCodec([[['x', u32], ['y', u32]]])],
  [Event.KeyPress, getStructCodec([[['key', u32]]])]
]);

codec.encode({ __kind: Event.Click, x: 1, y: 2 });
codec.encode({ __kind: Event.KeyPress, key: 3 });
```

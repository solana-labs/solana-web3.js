---
'@solana/codecs-data-structures': patch
---

DataEnum codecs now support custom discriminator properties

```ts
const codec = getDataEnumCodec([
  ['click', getStructCodec([[['x', u32], ['y', u32]]])],
  ['keyPress', getStructCodec([[['key', u32]]])]
], { discriminator: 'event' });

codec.encode({ event: 'click', x: 1, y: 2 });
codec.encode({ event: 'keyPress', key: 3 });
```

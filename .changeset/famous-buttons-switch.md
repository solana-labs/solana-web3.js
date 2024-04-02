---
'@solana/codecs-numbers': patch
---

Used capitalised variant names for `Endian` enum

This makes the enum more consistent with other enums in the library.

```ts
// Before.
Endian.BIG;
Endian.LITTLE;

// After.
Endian.Big;
Endian.Little;
```
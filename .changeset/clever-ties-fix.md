---
'@solana/addresses': patch
---

`isAddress()` no longer throws despite that the input might be unparseable as a base-58 string. Now, it correctly, simply, returns `false`.

---
'@solana/rpc-api': patch
---

Fixed a TypeScript error where the return value of `simulateTransaction` claimed there was an `accounts` property at the top level when it is in fact `value.accounts`

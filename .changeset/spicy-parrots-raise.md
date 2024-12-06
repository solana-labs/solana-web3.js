---
'@solana/transaction-messages': patch
'@solana/instructions': patch
'@solana/errors': patch
---

Change `data` field of transaction message instructions to use `ReadonlyUint8Array`

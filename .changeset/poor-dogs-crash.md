---
"@solana/transaction-confirmation": patch
---

Changes `createNonceInvalidationPromiseFactory` to enforce `rpc` and `rpcSubscriptions` to have matching clusters, changing the function signature to accept an object rather than two parameters.

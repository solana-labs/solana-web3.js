---
'@solana/web3.js': patch
---

Fixed the type of `config` on `getComputeUnitEstimateForTransactionMessage`. It is now optional and does not include `transactionMessage`.

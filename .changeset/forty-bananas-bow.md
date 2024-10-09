---
'@solana/transaction-confirmation': patch
---

Fixed a bug that could result in the transaction confirmer claiming that the blockheight had been exceeded, when the fact of the matter was that the confirmation was aborted by an `AbortSignal`

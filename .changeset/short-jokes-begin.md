---
'@solana/signers': patch
---

The `signAndSendTransactionMessageWithSigners` function now automatically asserts that the provided transaction message contains a single sending signer and fails otherwise.

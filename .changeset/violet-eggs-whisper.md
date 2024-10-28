---
'@solana/signers': patch
---

Remove the `feePayerSigner` attribute of transaction messages in favour of the existing `feePayer` attribute. This ensures fee payers are defined in a single place — whether they are using signers or not.

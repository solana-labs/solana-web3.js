---
'@solana/signers': patch
---

Override `feePayer` signer when the address matches the existing one. This is because users may want to provide a different wallet from the same address.

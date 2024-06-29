---
'@solana/signers': minor
---

Transaction signers' methods now take `minContextSlot` as an option. This is important for signers that simulate transactions, like wallets. They might be interested in knowing the slot at which the transaction was prepared, lest they run simulation at too early a slot.

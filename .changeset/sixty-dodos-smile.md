---
"@solana/transaction-messages": patch
"@solana/transactions": patch
---

Refactor transactions, to separate constructing transaction messages from signing/sending compiled transactions

A transaction message contains a transaction version and an array of transaction instructions. It may also have a fee payer and a lifetime. Transaction messages can be built up incrementally, for example by adding instructions or a fee payer.

Transactions represent a compiled transaction message (serialized to an immutable byte array) and a map of signatures for each required signer of the transaction message. These signatures are only valid for the byte array stored in the transaction. Transactions can be signed by updating this map of signatures, and when they have a valid signature for all required signers they can be landed on the network.

Note that this change essentially splits the previous `@solana/transactions` API in two, with functionality for creating/modifying transaction messages moved to `@solana/transaction-messages`.
---
'@solana/rpc-api': patch
---

The `simulateTransaction` RPC method now accepts an `innerInstructions` param. When `true`, the simulation result will include an array of inner instructions, if any.

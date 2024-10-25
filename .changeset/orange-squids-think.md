---
'@solana/rpc-subscriptions': patch
---

Adds a channel creator function called `createDefaultSolanaRpcSubscriptionsChannelCreator`. This function works similarly to `createDefaultRpcSubscriptionsChannelCreator` but with some Solana-specific defaults. For instance, it safely handles `BigInt` values in JSON messages since Solana RPC servers accept and return integers larger than `Number.MAX_SAFE_INTEGER`.

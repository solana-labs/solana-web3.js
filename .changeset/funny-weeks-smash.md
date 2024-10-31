---
'@solana/rpc-subscriptions': patch
'@solana/rpc-spec-types': patch
'@solana/rpc-spec': patch
---

Fixed a bug where the subcription server's response would not be detected, because of a mismatch in the format of the `id`. Now all RPC message ids are strings, for avoidance of doubt.

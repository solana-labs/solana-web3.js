---
'@solana/errors': patch
---

The `innerInstructions` property of JSON-RPC errors used snake case rather than camelCase for `stackHeight` and `programId`. This has been corrected.

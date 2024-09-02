---
'@solana/rpc-transport-http': patch
---

Add new `createHttpTransportForSolanaRpc` function that creates a new HTTP transport specific to the Solana RPC API. This transport uses custom JSON parsing and stringifying strategies on both the request and response of Solana RPC API requests in order to prevents loss of precision for large integers.

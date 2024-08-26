---
'@solana/rpc': patch
'@solana/rpc-subscriptions': patch
'@solana/rpc-transformers': patch
---

Change first argument of `onIntegerOverflow` handler from `methodName: string` to `request: RpcRequest`

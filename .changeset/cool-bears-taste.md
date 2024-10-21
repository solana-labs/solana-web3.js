---
'@solana/rpc-subscriptions-spec': patch
'@solana/rpc-subscriptions-api': patch
'@solana/rpc-transport-http': patch
'@solana/rpc-subscriptions': patch
'@solana/rpc-transformers': patch
'@solana/rpc-spec-types': patch
'@solana/rpc-spec': patch
'@solana/web3.js': patch
'@solana/rpc': patch
---

Use `RpcRequest`, `RpcResponse` and their transformers in RPC Subscriptions packages

This change makes the RPC and RPC Subscriptions architecture more consistent by using the same `RpcRequest` and `RpcResponse` types and transformers as the basis for handling user requests (RPC calls or subscriptions) and returning responses to them.

See the following PRs for more details:
- [PR #3393](https://github.com/solana-labs/solana-web3.js/pull/3393)
- [PR #3394](https://github.com/solana-labs/solana-web3.js/pull/3394)
- [PR #3403](https://github.com/solana-labs/solana-web3.js/pull/3403)
- [PR #3404](https://github.com/solana-labs/solana-web3.js/pull/3404)
- [PR #3405](https://github.com/solana-labs/solana-web3.js/pull/3405)

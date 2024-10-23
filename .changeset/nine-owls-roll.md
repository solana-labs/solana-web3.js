---
'@solana/rpc-spec': patch
---

Redesign the `RpcPlan` by using a plan executor function.

This change replaces the `payload` and `responseTransformer` attributes of the `RpcPlan` type (returned by the RPC API) in favour of a new `execute` function that accepts an `RpcTransport` and an optional `AbortSignal` and return an `RpcResponse`. That way, the RPC API is able to completely wrap the RPC Transport layer and can do things like: not calling the transport at all for caching purposes or calling the transport multiple times for retries or even for aggregating responses from multiple RPC calls.

See the following PRs for more details:
- [PR #3430](https://github.com/solana-labs/solana-web3.js/pull/3430)
- [PR #3431](https://github.com/solana-labs/solana-web3.js/pull/3431)

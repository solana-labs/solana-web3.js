---
'@solana/rpc': patch
---

Fixed a bug where coalesced RPC calls could end up aborted even though there were still interested consumers. This would happen if the consumer count fell to zero, then rose above zero again, in the same runloop.

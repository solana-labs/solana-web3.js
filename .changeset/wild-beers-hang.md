---
'@solana/rpc-subscriptions': patch
'@solana/rpc-subscriptions-api': patch
'@solana/rpc-subscriptions-channel-websocket': patch
'@solana/rpc-subscriptions-spec': patch
---

We refactored the lower levels of the subscriptions API entirely.

Previously, all layers of the subscriptions implementation, from the `WebSocket` transport to the API that developers use, dealt in `AsyncIterables`. These are notoriously difficult to code in such a way that expresses all of the ways in which a subscription might be cancelled or error out. Very slight omissions of care could open memory leaks that would bring down the simplest of apps. The new subscriptions infra in Release Candidate 2 deals with event-based subscriptions all the way up to the highest level API, at which point the subscription is vended to the application as an `AsyncIterable`.

This has eliminated several classes of memory leak and has made it easier to implement higher-level transports (like the autopinger and the subscription coalescer). Additionally, this update introduces a new channel pool implementation that opens new `WebSocket` connections when existing ones become ‘full.’ Lastly, performance in the new implementation has been improved through a new demultiplexing utility that can separate `message` events into several channels based on arbitrary criteria, meaning you can apply transforms to the message right at the source, and vend subscriptions to downstream consumers that care only about one particular kind of message.

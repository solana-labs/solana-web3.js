---
'@solana/subscribable': patch
---

Creates a package for working with subscribable data sources like event targets. From an `EventTarget` or object which conforms to the `EventEmitter` interface you can now create a more ergonomic `DataPublisher` (object with an `on` method that vends an unsubscribe function) or an abortable `AsyncIterable`.

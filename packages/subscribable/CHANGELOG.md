# @solana/subscribable

## 2.0.0-rc.2

### Patch Changes

-   [#3301](https://github.com/solana-labs/solana-web3.js/pull/3301) [`8c2cb9f`](https://github.com/solana-labs/solana-web3.js/commit/8c2cb9f44a52b3c27bc15c2c972bea1aae1622e7) Thanks [@steveluscher](https://github.com/steveluscher)! - Creates a package for working with subscribable data sources like event targets. From an `EventTarget` or object which conforms to the `EventEmitter` interface you can now create a more ergonomic `DataPublisher` (object with an `on` method that vends an unsubscribe function) or an abortable `AsyncIterable`.

-   Updated dependencies [[`38faba0`](https://github.com/solana-labs/solana-web3.js/commit/38faba05fab479ddbd95d0e211744d203f8aa823), [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a)]:
    -   @solana/errors@2.0.0-rc.2

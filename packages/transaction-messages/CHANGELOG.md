# @solana/transaction-messages

## 2.0.0-rc.2

### Patch Changes

-   [#3137](https://github.com/solana-labs/solana-web3.js/pull/3137) [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a) Thanks [@mcintyre94](https://github.com/mcintyre94)! - Add edge-light to package exports

-   Updated dependencies [[`38faba0`](https://github.com/solana-labs/solana-web3.js/commit/38faba05fab479ddbd95d0e211744d203f8aa823), [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a)]:
    -   @solana/rpc-types@2.0.0-rc.2
    -   @solana/errors@2.0.0-rc.2
    -   @solana/codecs-data-structures@2.0.0-rc.2
    -   @solana/codecs-numbers@2.0.0-rc.2
    -   @solana/instructions@2.0.0-rc.2
    -   @solana/codecs-core@2.0.0-rc.2
    -   @solana/functional@2.0.0-rc.2
    -   @solana/addresses@2.0.0-rc.2

## 2.0.0-rc.1

### Patch Changes

-   Updated dependencies []:
    -   @solana/addresses@2.0.0-rc.1
    -   @solana/codecs-core@2.0.0-rc.1
    -   @solana/codecs-data-structures@2.0.0-rc.1
    -   @solana/codecs-numbers@2.0.0-rc.1
    -   @solana/errors@2.0.0-rc.1
    -   @solana/functional@2.0.0-rc.1
    -   @solana/instructions@2.0.0-rc.1
    -   @solana/rpc-types@2.0.0-rc.1

## 2.0.0-rc.0

### Patch Changes

-   [#2969](https://github.com/solana-labs/solana-web3.js/pull/2969) [`419c12e`](https://github.com/solana-labs/solana-web3.js/commit/419c12e617435570d0cded6ca6d35370d0060da7) Thanks [@mcintyre94](https://github.com/mcintyre94)! - Add a function to replace accounts in a transaction message using lookup tables

-   Updated dependencies [[`677a9c4`](https://github.com/solana-labs/solana-web3.js/commit/677a9c4eb88a8ac6a9ede8d82f367c5ac8d69ff4)]:
    -   @solana/errors@2.0.0-rc.0
    -   @solana/addresses@2.0.0-rc.0
    -   @solana/codecs-core@2.0.0-rc.0
    -   @solana/codecs-data-structures@2.0.0-rc.0
    -   @solana/codecs-numbers@2.0.0-rc.0
    -   @solana/instructions@2.0.0-rc.0
    -   @solana/rpc-types@2.0.0-rc.0
    -   @solana/functional@2.0.0-rc.0

## 2.0.0-preview.4

### Patch Changes

-   [#2607](https://github.com/solana-labs/solana-web3.js/pull/2607) [`3d90241`](https://github.com/solana-labs/solana-web3.js/commit/3d902419c1b232fa7145757b9c95976de69790c7) Thanks [@mcintyre94](https://github.com/mcintyre94)! - Freeze the instructions and lifetimeConstraint fields within transaction messages

-   [#2606](https://github.com/solana-labs/solana-web3.js/pull/2606) [`367b8ad`](https://github.com/solana-labs/solana-web3.js/commit/367b8ad0cce55a916abfb0125f36b6e844333b2b) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Use commonjs package type

-   Updated dependencies [[`26dae19`](https://github.com/solana-labs/solana-web3.js/commit/26dae190c2ec835fbdaa7b7d66ca33d6ba0727b8), [`4f19842`](https://github.com/solana-labs/solana-web3.js/commit/4f198423997d28d927f982333d268e19940656df), [`73bd5a9`](https://github.com/solana-labs/solana-web3.js/commit/73bd5a9e0b32846cd5d76f2d2d1b21661eab0677), [`be36bab`](https://github.com/solana-labs/solana-web3.js/commit/be36babd752b1c987a2f53b4ff83ac8c045a3418), [`367b8ad`](https://github.com/solana-labs/solana-web3.js/commit/367b8ad0cce55a916abfb0125f36b6e844333b2b)]:
    -   @solana/codecs-data-structures@2.0.0-preview.4
    -   @solana/errors@2.0.0-preview.4
    -   @solana/rpc-types@2.0.0-preview.4
    -   @solana/codecs-numbers@2.0.0-preview.4
    -   @solana/instructions@2.0.0-preview.4
    -   @solana/codecs-core@2.0.0-preview.4
    -   @solana/functional@2.0.0-preview.4
    -   @solana/addresses@2.0.0-preview.4

## 2.0.0-preview.3

### Patch Changes

-   [#2550](https://github.com/solana-labs/solana-web3.js/pull/2550) [`54d68c4`](https://github.com/solana-labs/solana-web3.js/commit/54d68c482feebf4e62a9896b3badd77dab615941) Thanks [@mcintyre94](https://github.com/mcintyre94)! - Refactor transactions, to separate constructing transaction messages from signing/sending compiled transactions

    A transaction message contains a transaction version and an array of transaction instructions. It may also have a fee payer and a lifetime. Transaction messages can be built up incrementally, for example by adding instructions or a fee payer.

    Transactions represent a compiled transaction message (serialized to an immutable byte array) and a map of signatures for each required signer of the transaction message. These signatures are only valid for the byte array stored in the transaction. Transactions can be signed by updating this map of signatures, and when they have a valid signature for all required signers they can be landed on the network.

    Note that this change essentially splits the previous `@solana/transactions` API in two, with functionality for creating/modifying transaction messages moved to `@solana/transaction-messages`.

-   Updated dependencies [[`9370133`](https://github.com/solana-labs/solana-web3.js/commit/9370133e414bfa863517248d97905449e9a867eb), [`31916ae`](https://github.com/solana-labs/solana-web3.js/commit/31916ae5d4fb29f239c63252a59745e33a6979ea), [`a548de2`](https://github.com/solana-labs/solana-web3.js/commit/a548de2ebe3cf7289fd126933c4c395c885c3224), [`ff4aff6`](https://github.com/solana-labs/solana-web3.js/commit/ff4aff61c05c0ae5bfb62d35353d9527588b39b6), [`89f399d`](https://github.com/solana-labs/solana-web3.js/commit/89f399d474abac463b1daaa864c88305d7b8c21f), [`deb7b80`](https://github.com/solana-labs/solana-web3.js/commit/deb7b806b4cbe620b1714be1765c981d88c3a2f6), [`6dcf548`](https://github.com/solana-labs/solana-web3.js/commit/6dcf5483bb6bbb8d343db28dedb258c8da91ffac), [`ebb03cd`](https://github.com/solana-labs/solana-web3.js/commit/ebb03cd8270027db957d4cecc7d2374d468d4ccb), [`49a764c`](https://github.com/solana-labs/solana-web3.js/commit/49a764c6d481886501540f8dbfe8be75d754355b), [`002cc38`](https://github.com/solana-labs/solana-web3.js/commit/002cc38a99cd4c91c7ce9023e1b4fb28f7e10832), [`ce1be3f`](https://github.com/solana-labs/solana-web3.js/commit/ce1be3fe37ea9b744fd836f3d6c2c8e5e31efd77), [`82cf07f`](https://github.com/solana-labs/solana-web3.js/commit/82cf07f4e905f6b056e70a0463a94222c3e7cadd), [`2d54650`](https://github.com/solana-labs/solana-web3.js/commit/2d5465018d8060eceb00efbf4f718df26d145199), [`bef9604`](https://github.com/solana-labs/solana-web3.js/commit/bef960435eb2303395bfa76e44f84d3348c5722d), [`7e86583`](https://github.com/solana-labs/solana-web3.js/commit/7e86583da68695076ec62033f3fe078b3890f026), [`919c736`](https://github.com/solana-labs/solana-web3.js/commit/919c7367dec8e142746295128cc6c2cc6752e636), [`2e5af9f`](https://github.com/solana-labs/solana-web3.js/commit/2e5af9f1a9410f15108863342b48225fdf9a0c83), [`2d48c09`](https://github.com/solana-labs/solana-web3.js/commit/2d48c0954a3823b937a9b4e572a8d63cd7e4631c), [`e3e82d9`](https://github.com/solana-labs/solana-web3.js/commit/e3e82d909825e958ae234ed18500335a621773bd), [`288029a`](https://github.com/solana-labs/solana-web3.js/commit/288029a55a5eeb863b6df960027a59214ffc37f1), [`4ae78f5`](https://github.com/solana-labs/solana-web3.js/commit/4ae78f5cdddd6772b25351beb813483d4e52cea6), [`478443f`](https://github.com/solana-labs/solana-web3.js/commit/478443fedac06678f12e8ac285aa7c7fcf503ee8), [`bf029dd`](https://github.com/solana-labs/solana-web3.js/commit/bf029dd90230405b3d59f70aedd57fc0117b926e), [`125fc15`](https://github.com/solana-labs/solana-web3.js/commit/125fc1540cfbc0a4afdba5aabac0884c750e58c1)]:
    -   @solana/errors@2.0.0-preview.3
    -   @solana/codecs-data-structures@2.0.0-preview.3
    -   @solana/codecs-core@2.0.0-preview.3
    -   @solana/addresses@2.0.0-preview.3
    -   @solana/rpc-types@2.0.0-preview.3
    -   @solana/codecs-numbers@2.0.0-preview.3
    -   @solana/instructions@2.0.0-preview.3
    -   @solana/functional@2.0.0-preview.3

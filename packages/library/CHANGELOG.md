# @solana/web3.js

## 2.0.0-rc.2

### Patch Changes

-   [#3137](https://github.com/solana-labs/solana-web3.js/pull/3137) [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a) Thanks [@mcintyre94](https://github.com/mcintyre94)! - Add edge-light to package exports

-   Updated dependencies [[`38faba0`](https://github.com/solana-labs/solana-web3.js/commit/38faba05fab479ddbd95d0e211744d203f8aa823), [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a), [`0158b31`](https://github.com/solana-labs/solana-web3.js/commit/0158b3181ed96996f269f3bff689f76411e460b3)]:
    -   @solana/rpc-parsed-types@2.0.0-rc.2
    -   @solana/rpc-types@2.0.0-rc.2
    -   @solana/sysvars@2.0.0-rc.2
    -   @solana/errors@2.0.0-rc.2
    -   @solana/transaction-confirmation@2.0.0-rc.2
    -   @solana/transaction-messages@2.0.0-rc.2
    -   @solana/rpc-subscriptions@2.0.0-rc.2
    -   @solana/instructions@2.0.0-rc.2
    -   @solana/transactions@2.0.0-rc.2
    -   @solana/functional@2.0.0-rc.2
    -   @solana/addresses@2.0.0-rc.2
    -   @solana/accounts@2.0.0-rc.2
    -   @solana/programs@2.0.0-rc.2
    -   @solana/signers@2.0.0-rc.2
    -   @solana/codecs@2.0.0-rc.2
    -   @solana/keys@2.0.0-rc.2
    -   @solana/rpc@2.0.0-rc.2

## 2.0.0-rc.1

### Patch Changes

-   Updated dependencies [[`7d310f6`](https://github.com/solana-labs/solana-web3.js/commit/7d310f6f9cd7d02fca4d6f8e311b857c9dd84e61), [`1ad523d`](https://github.com/solana-labs/solana-web3.js/commit/1ad523dc5792d9152a66e9dc2b83294e3eba4db0), [`c122c75`](https://github.com/solana-labs/solana-web3.js/commit/c122c75936e8fa5364edf114a5182cf119b26922), [`f9a8446`](https://github.com/solana-labs/solana-web3.js/commit/f9a84460670a97d4ab6514b28fe0d29c6fac3302)]:
    -   @solana/keys@2.0.0-rc.1
    -   @solana/signers@2.0.0-rc.1
    -   @solana/transaction-confirmation@2.0.0-rc.1
    -   @solana/rpc-subscriptions@2.0.0-rc.1
    -   @solana/transactions@2.0.0-rc.1
    -   @solana/rpc@2.0.0-rc.1
    -   @solana/sysvars@2.0.0-rc.1
    -   @solana/accounts@2.0.0-rc.1
    -   @solana/addresses@2.0.0-rc.1
    -   @solana/codecs@2.0.0-rc.1
    -   @solana/errors@2.0.0-rc.1
    -   @solana/functional@2.0.0-rc.1
    -   @solana/instructions@2.0.0-rc.1
    -   @solana/programs@2.0.0-rc.1
    -   @solana/rpc-parsed-types@2.0.0-rc.1
    -   @solana/rpc-types@2.0.0-rc.1
    -   @solana/transaction-messages@2.0.0-rc.1

## 2.0.0-rc.0

### Patch Changes

-   [#2905](https://github.com/solana-labs/solana-web3.js/pull/2905) [`56fde06`](https://github.com/solana-labs/solana-web3.js/commit/56fde06003841228d4e7de162059dda648f1043d) Thanks [@steveluscher](https://github.com/steveluscher)! - Fixed the type of `config` on `getComputeUnitEstimateForTransactionMessage`. It is now optional and does not include `transactionMessage`.

-   Updated dependencies [[`42a70f4`](https://github.com/solana-labs/solana-web3.js/commit/42a70f4c3004e55fe6ce5a8e500f5610765ec66f), [`419c12e`](https://github.com/solana-labs/solana-web3.js/commit/419c12e617435570d0cded6ca6d35370d0060da7), [`677a9c4`](https://github.com/solana-labs/solana-web3.js/commit/677a9c4eb88a8ac6a9ede8d82f367c5ac8d69ff4), [`9239e6e`](https://github.com/solana-labs/solana-web3.js/commit/9239e6ec972b4de9f0d15b197fbef1d2871759d9)]:
    -   @solana/rpc@2.0.0-rc.0
    -   @solana/transaction-messages@2.0.0-rc.0
    -   @solana/errors@2.0.0-rc.0
    -   @solana/rpc-subscriptions@2.0.0-rc.0
    -   @solana/programs@2.0.0-rc.0
    -   @solana/transaction-confirmation@2.0.0-rc.0
    -   @solana/signers@2.0.0-rc.0
    -   @solana/transactions@2.0.0-rc.0
    -   @solana/accounts@2.0.0-rc.0
    -   @solana/sysvars@2.0.0-rc.0
    -   @solana/addresses@2.0.0-rc.0
    -   @solana/instructions@2.0.0-rc.0
    -   @solana/keys@2.0.0-rc.0
    -   @solana/rpc-types@2.0.0-rc.0
    -   @solana/rpc-parsed-types@2.0.0-rc.0
    -   @solana/codecs@2.0.0-rc.0
    -   @solana/functional@2.0.0-rc.0

## 2.0.0-preview.4

### Major Changes

-   This version of the `@solana/web3.js` Technology Preview fixes a bug with the default RPC transport, adds a utility that you can use to get an estimate of a transaction message's compute unit cost, and introduces `@solana/react` hooks for interacting with Wallet Standard wallets.

    To install the fourth Technology Preview:

    ```shell
    npm install --save @solana/web3.js@tp4
    ```

    For an example of how to use the new `@solana/react` package to interact with wallets in a React application, see the example application in [`examples/react-app`](https://github.com/solana-labs/solana-web3.js/tree/master/examples/react-app#readme). We hope to see similar wallet-connection packages patterned off `@solana/react` for other application frameworks soon.

    Try a demo of Technology Preview 4 in your browser at [CodeSandbox](https://codesandbox.io/p/sandbox/solana-javascript-sdk-technology-preview-4-h8cz4v?file=%2Fsrc%2Findex.ts%3A21%2C8).

    -   [#2858](https://github.com/solana-labs/solana-web3.js/pull/2858) [`22a34aa`](https://github.com/solana-labs/solana-web3.js/commit/22a34aa08d1be7e9b43ccfea94a99eaa2694e491) Thanks [@steveluscher](https://github.com/steveluscher)! - Transaction signers' methods now take `minContextSlot` as an option. This is important for signers that simulate transactions, like wallets. They might be interested in knowing the slot at which the transaction was prepared, lest they run simulation at too early a slot.
    -   [#2852](https://github.com/solana-labs/solana-web3.js/pull/2852) [`cec9048`](https://github.com/solana-labs/solana-web3.js/commit/cec9048b2f83535df7e499db5488c336981dfb5a) Thanks [@lorisleiva](https://github.com/lorisleiva)! - The `signAndSendTransactionMessageWithSigners` function now automatically asserts that the provided transaction message contains a single sending signer and fails otherwise.
    -   [#2707](https://github.com/solana-labs/solana-web3.js/pull/2707) [`cb49bfa`](https://github.com/solana-labs/solana-web3.js/commit/cb49bfa28f412376a41e758eeda59e7e90983147) Thanks [@mcintyre94](https://github.com/mcintyre94)! - Allow creating keypairs and keys from ReadonlyUint8Array
    -   [#2715](https://github.com/solana-labs/solana-web3.js/pull/2715) [`26dae19`](https://github.com/solana-labs/solana-web3.js/commit/26dae190c2ec835fbdaa7b7d66ca33d6ba0727b8) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Consolidated `getNullableCodec` and `getOptionCodec` with their `Zeroable` counterparts and added more configurations

        Namely, the `prefix` option can now be set to `null` and the `fixed` option was replaced with the `noneValue` option which can be set to `"zeroes"` for `Zeroable` codecs or a custom byte array for custom representations of none values. This means the `getZeroableNullableCodec` and `getZeroableOptionCodec` functions were removed in favor of the new options.

        ```ts
        // Before.
        getZeroableNullableCodec(getU16Codec());

        // After.
        getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: null });
        ```

        Additionally, it is now possible to create nullable codecs that have no `prefix` nor `noneValue`. In this case, the existence of the nullable item is indicated by the presence of any remaining bytes left to decode.

        ```ts
        const codec = getNullableCodec(getU16Codec(), { prefix: null });
        codec.encode(42); // 0x2a00
        codec.encode(null); // Encodes nothing.
        codec.decode(new Uint8Array([42, 0])); // 42
        codec.decode(new Uint8Array([])); // null
        ```

        Also note that it is now possible for custom `noneValue` byte arrays to be of any length — previously, it had to match the fixed-size of the nullable item.

        Here is a recap of all supported scenarios, using a `u16` codec as an example:

        | `encode(42)` / `encode(null)` | No `noneValue` (default) | `noneValue: "zeroes"`       | Custom `noneValue` (`0xff`) |
        | ----------------------------- | ------------------------ | --------------------------- | --------------------------- |
        | `u8` prefix (default)         | `0x012a00` / `0x00`      | `0x012a00` / `0x000000`     | `0x012a00` / `0x00ff`       |
        | Custom `prefix` (`u16`)       | `0x01002a00` / `0x0000`  | `0x01002a00` / `0x00000000` | `0x01002a00` / `0x0000ff`   |
        | No `prefix`                   | `0x2a00` / `0x`          | `0x2a00` / `0x0000`         | `0x2a00` / `0xff`           |

        Reciprocal changes were made with `getOptionCodec`.

    -   [#2785](https://github.com/solana-labs/solana-web3.js/pull/2785) [`4f19842`](https://github.com/solana-labs/solana-web3.js/commit/4f198423997d28d927f982333d268e19940656df) Thanks [@steveluscher](https://github.com/steveluscher)! - The development mode error message printer no longer fatals on Safari &lt; 16.4.
    -   [#2867](https://github.com/solana-labs/solana-web3.js/pull/2867) [`be36bab`](https://github.com/solana-labs/solana-web3.js/commit/be36babd752b1c987a2f53b4ff83ac8c045a3418) Thanks [@steveluscher](https://github.com/steveluscher)! - The `innerInstructions` property of JSON-RPC errors used snake case rather than camelCase for `stackHeight` and `programId`. This has been corrected.
    -   [#2728](https://github.com/solana-labs/solana-web3.js/pull/2728) [`f1e9ac2`](https://github.com/solana-labs/solana-web3.js/commit/f1e9ac2af579e4fbfb5550cbdbd971a87a4e4432) Thanks [@joncinque](https://github.com/joncinque)! - Simulate with the maximum quantity of compute units (1.4M) instead of `u32::MAX`
    -   [#2703](https://github.com/solana-labs/solana-web3.js/pull/2703) [`0908628`](https://github.com/solana-labs/solana-web3.js/commit/09086289a230aa1b780c1035408b48243ab960f2) Thanks [@steveluscher](https://github.com/steveluscher)! - Created a utility function to estimate the compute unit consumption of a transaction message
    -   [#2795](https://github.com/solana-labs/solana-web3.js/pull/2795) [`ce876d9`](https://github.com/solana-labs/solana-web3.js/commit/ce876d99f04d539292abd810acd77a319c52f50d) Thanks [@steveluscher](https://github.com/steveluscher)! - Added React hooks to which you can pass a Wallet Standard `UiWalletAccount` and obtain a `MessageModifyingSigner`, `TransactionModifyingSigner`, or `TransactionSendingSigner` for use in constructing, signing, and sending Solana transactions and messages
    -   [#2772](https://github.com/solana-labs/solana-web3.js/pull/2772) [`8fe4551`](https://github.com/solana-labs/solana-web3.js/commit/8fe4551217a3ad8bfdcd1609ac7b23e8fd044c72) Thanks [@steveluscher](https://github.com/steveluscher)! - Added a series of React hooks to which you can pass a Wallet Standard `UiWalletAccount` to extract its `signMessage`, `signTransaction`, and `signAndSendTransaction` features
    -   [#2819](https://github.com/solana-labs/solana-web3.js/pull/2819) [`7ee47ae`](https://github.com/solana-labs/solana-web3.js/commit/7ee47ae24ad73b429ee863342f300a6f6c49e3d2) Thanks [@steveluscher](https://github.com/steveluscher)! - Fixed a bug where coalesced RPC calls could end up aborted even though there were still interested consumers. This would happen if the consumer count fell to zero, then rose above zero again, in the same runloop.
    -   [#2868](https://github.com/solana-labs/solana-web3.js/pull/2868) [`91fb1f3`](https://github.com/solana-labs/solana-web3.js/commit/91fb1f39bb174cf1e899a21365153a7b3bbf3571) Thanks [@steveluscher](https://github.com/steveluscher)! - The `simulateTransaction` RPC method now accepts an `innerInstructions` param. When `true`, the simulation result will include an array of inner instructions, if any.
    -   [#2866](https://github.com/solana-labs/solana-web3.js/pull/2866) [`73bd5a9`](https://github.com/solana-labs/solana-web3.js/commit/73bd5a9e0b32846cd5d76f2d2d1b21661eab0677) Thanks [@steveluscher](https://github.com/steveluscher)! - The `TransactionInstruction` RPC type now has `stackHeight`
    -   [#2751](https://github.com/solana-labs/solana-web3.js/pull/2751) [`6340744`](https://github.com/solana-labs/solana-web3.js/commit/6340744e5cf0ea91ae677f381d5a187638a19597) Thanks [@mcintyre94](https://github.com/mcintyre94)! - Allow Rpc Request params to be any type, instead of requiring an array

### Patch Changes

-   [#2728](https://github.com/solana-labs/solana-web3.js/pull/2728) [`f1e9ac2`](https://github.com/solana-labs/solana-web3.js/commit/f1e9ac2af579e4fbfb5550cbdbd971a87a4e4432) Thanks [@joncinque](https://github.com/joncinque)! - Simulate with the maximum quantity of compute units (1.4M) instead of `u32::MAX`

-   [#2606](https://github.com/solana-labs/solana-web3.js/pull/2606) [`367b8ad`](https://github.com/solana-labs/solana-web3.js/commit/367b8ad0cce55a916abfb0125f36b6e844333b2b) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Use commonjs package type

-   [#2703](https://github.com/solana-labs/solana-web3.js/pull/2703) [`0908628`](https://github.com/solana-labs/solana-web3.js/commit/09086289a230aa1b780c1035408b48243ab960f2) Thanks [@steveluscher](https://github.com/steveluscher)! - Created a utility function to estimate the compute unit consumption of a transaction message

-   Updated dependencies [[`7ee47ae`](https://github.com/solana-labs/solana-web3.js/commit/7ee47ae24ad73b429ee863342f300a6f6c49e3d2), [`26dae19`](https://github.com/solana-labs/solana-web3.js/commit/26dae190c2ec835fbdaa7b7d66ca33d6ba0727b8), [`4f19842`](https://github.com/solana-labs/solana-web3.js/commit/4f198423997d28d927f982333d268e19940656df), [`73bd5a9`](https://github.com/solana-labs/solana-web3.js/commit/73bd5a9e0b32846cd5d76f2d2d1b21661eab0677), [`cec9048`](https://github.com/solana-labs/solana-web3.js/commit/cec9048b2f83535df7e499db5488c336981dfb5a), [`be36bab`](https://github.com/solana-labs/solana-web3.js/commit/be36babd752b1c987a2f53b4ff83ac8c045a3418), [`cb49bfa`](https://github.com/solana-labs/solana-web3.js/commit/cb49bfa28f412376a41e758eeda59e7e90983147), [`3d90241`](https://github.com/solana-labs/solana-web3.js/commit/3d902419c1b232fa7145757b9c95976de69790c7), [`367b8ad`](https://github.com/solana-labs/solana-web3.js/commit/367b8ad0cce55a916abfb0125f36b6e844333b2b), [`22a34aa`](https://github.com/solana-labs/solana-web3.js/commit/22a34aa08d1be7e9b43ccfea94a99eaa2694e491)]:
    -   @solana/rpc@2.0.0-preview.4
    -   @solana/codecs@2.0.0-preview.4
    -   @solana/errors@2.0.0-preview.4
    -   @solana/rpc-types@2.0.0-preview.4
    -   @solana/signers@2.0.0-preview.4
    -   @solana/keys@2.0.0-preview.4
    -   @solana/transaction-messages@2.0.0-preview.4
    -   @solana/transaction-confirmation@2.0.0-preview.4
    -   @solana/rpc-subscriptions@2.0.0-preview.4
    -   @solana/rpc-parsed-types@2.0.0-preview.4
    -   @solana/instructions@2.0.0-preview.4
    -   @solana/transactions@2.0.0-preview.4
    -   @solana/functional@2.0.0-preview.4
    -   @solana/addresses@2.0.0-preview.4
    -   @solana/accounts@2.0.0-preview.4
    -   @solana/programs@2.0.0-preview.4
    -   @solana/sysvars@2.0.0-preview.4

## 2.0.0-preview.3

### Patch Changes

-   [#2504](https://github.com/solana-labs/solana-web3.js/pull/2504) [`18d6b56`](https://github.com/solana-labs/solana-web3.js/commit/18d6b56a69509e4c98de8f3de51abe2623b46763) Thanks [@steveluscher](https://github.com/steveluscher)! - Replaced `fast-stable-stringify` with our fork

-   Updated dependencies [[`9370133`](https://github.com/solana-labs/solana-web3.js/commit/9370133e414bfa863517248d97905449e9a867eb), [`31916ae`](https://github.com/solana-labs/solana-web3.js/commit/31916ae5d4fb29f239c63252a59745e33a6979ea), [`89f399d`](https://github.com/solana-labs/solana-web3.js/commit/89f399d474abac463b1daaa864c88305d7b8c21f), [`ebb03cd`](https://github.com/solana-labs/solana-web3.js/commit/ebb03cd8270027db957d4cecc7d2374d468d4ccb), [`002cc38`](https://github.com/solana-labs/solana-web3.js/commit/002cc38a99cd4c91c7ce9023e1b4fb28f7e10832), [`2040f96`](https://github.com/solana-labs/solana-web3.js/commit/2040f96cc22e4195749577d265cd6a76d8a08b87), [`ce1be3f`](https://github.com/solana-labs/solana-web3.js/commit/ce1be3fe37ea9b744fd836f3d6c2c8e5e31efd77), [`1672346`](https://github.com/solana-labs/solana-web3.js/commit/1672346246fe9444b018d726ab7bfcd4bb092ec2), [`82cf07f`](https://github.com/solana-labs/solana-web3.js/commit/82cf07f4e905f6b056e70a0463a94222c3e7cadd), [`2d54650`](https://github.com/solana-labs/solana-web3.js/commit/2d5465018d8060eceb00efbf4f718df26d145199), [`bef9604`](https://github.com/solana-labs/solana-web3.js/commit/bef960435eb2303395bfa76e44f84d3348c5722d), [`af9fa3b`](https://github.com/solana-labs/solana-web3.js/commit/af9fa3b7e83220d69eab67b37d3a36beac0e848c), [`7e86583`](https://github.com/solana-labs/solana-web3.js/commit/7e86583da68695076ec62033f3fe078b3890f026), [`0b02de1`](https://github.com/solana-labs/solana-web3.js/commit/0b02de140887654f19f8eda374f40c6f5a8f5e92), [`2e5af9f`](https://github.com/solana-labs/solana-web3.js/commit/2e5af9f1a9410f15108863342b48225fdf9a0c83), [`e3e82d9`](https://github.com/solana-labs/solana-web3.js/commit/e3e82d909825e958ae234ed18500335a621773bd), [`54d68c4`](https://github.com/solana-labs/solana-web3.js/commit/54d68c482feebf4e62a9896b3badd77dab615941), [`18d6b56`](https://github.com/solana-labs/solana-web3.js/commit/18d6b56a69509e4c98de8f3de51abe2623b46763), [`288029a`](https://github.com/solana-labs/solana-web3.js/commit/288029a55a5eeb863b6df960027a59214ffc37f1), [`4ae78f5`](https://github.com/solana-labs/solana-web3.js/commit/4ae78f5cdddd6772b25351beb813483d4e52cea6), [`478443f`](https://github.com/solana-labs/solana-web3.js/commit/478443fedac06678f12e8ac285aa7c7fcf503ee8), [`125fc15`](https://github.com/solana-labs/solana-web3.js/commit/125fc1540cfbc0a4afdba5aabac0884c750e58c1)]:
    -   @solana/errors@2.0.0-preview.3
    -   @solana/transactions@2.0.0-preview.3
    -   @solana/addresses@2.0.0-preview.3
    -   @solana/rpc-types@2.0.0-preview.3
    -   @solana/programs@2.0.0-preview.3
    -   @solana/codecs@2.0.0-preview.3
    -   @solana/transaction-confirmation@2.0.0-preview.3
    -   @solana/transaction-messages@2.0.0-preview.3
    -   @solana/rpc-subscriptions@2.0.0-preview.3
    -   @solana/rpc@2.0.0-preview.3
    -   @solana/keys@2.0.0-preview.3
    -   @solana/accounts@2.0.0-preview.3
    -   @solana/instructions@2.0.0-preview.3
    -   @solana/signers@2.0.0-preview.3
    -   @solana/rpc-parsed-types@2.0.0-preview.3
    -   @solana/functional@2.0.0-preview.3

## 2.0.0-preview.2

### Patch Changes

-   The first Technology Preview of `@solana/web3.js` 2.0 was [released at the Breakpoint conference](https://www.youtube.com/watch?v=JUJtAPhES5g) in November 2023. Based on your feedback, we want to get a second version of it into your hands now with some changes, bug fixes, and new features.

    To install the second Technology Preview:

    ```shell
    npm install --save @solana/web3.js@tp2
    ```

    Most notably, this release integrates with the new JavaScript client generator for on-chain programs. Instruction creators and account decoders can now be autogenerated for any program, including your own! Read more [here](https://github.com/solana-program/create-solana-program), and check out the growing list of autogenerated core programs [here](https://www.npmjs.com/search?q=%40solana-program).

    Try a demo of Technology Preview 2 in your browser at https://sola.na/web3tp2demo.

    -   Renamed `Base58EncodedAddress` to `Address` (#1814) [63683a4bc](https://github.com/solana-labs/solana-web3.js/commit/63683a4bc)
    -   Renamed `Ed25519Signature` and `TransactionSignature` to `SignatureBytes` and `Signature` (#1815) [205c09268](https://github.com/solana-labs/solana-web3.js/commit/205c09268)
    -   Fixed return type of `getSignaturesForAddress` (#1821) [36c7263bd](https://github.com/solana-labs/solana-web3.js/commit/36c7263bd)
    -   `signTransaction` now asserts that the transaction is fully signed; added `partiallySignTransaction` that does not (#1820) [7d54c2dad](https://github.com/solana-labs/solana-web3.js/commit/7d54c2dad)
    -   The `@solana/webcrypto-ed25519-polyfill` now sets the `crypto` global in Node [17a54d24a](https://github.com/solana-labs/solana-web3.js/commit/17a54d24a)
    -   Added `assertIsBlockhashLifetimeTransaction` that asserts transaction has a blockhash lifetime (#1908) [ae94ca38d](https://github.com/solana-labs/solana-web3.js/commit/ae94ca38d)
    -   Added a `createPrivateKeyFromBytes` helper (#1913) [85b7dfe13](https://github.com/solana-labs/solana-web3.js/commit/85b7dfe13)
    -   Added `@solana/accounts`; types and helper methods for representing, fetching and decoding Solana accounts (#1855) [e1ca3966e](https://github.com/solana-labs/solana-web3.js/commit/e1ca3966e)
    -   Export the TransactionError type (#1964) [4c009bf5b](https://github.com/solana-labs/solana-web3.js/commit/4c009bf5b)
    -   Export all RPC method XApi types from `@solana/rpc-core` (#1965) [ed98b3d9c](https://github.com/solana-labs/solana-web3.js/commit/ed98b3d9c)
    -   Added a generic `createJsonRpcApi` function for custom APIs [1e2106f21](https://github.com/solana-labs/solana-web3.js/commit/1e2106f21)
    -   Added a generic `createJsonRpcSubscriptionsApi` function for custom APIs [ae3f1f087](https://github.com/solana-labs/solana-web3.js/commit/ae3f1f087)
    -   RPC commitment now defaults to `confirmed` when not explicitly specified [cb7702ca5](https://github.com/solana-labs/solana-web3.js/commit/cb7702ca5)
    -   Added `ClusterUrl` types and handlers (#2084) [61f7ba0](https://github.com/solana-labs/solana-web3.js/commit/61f7ba0)
    -   RPC transports can now be cluster-specific, ie. `RpcDevnet<TRpcMethods>` & `RpcSubscriptionsDevnet<TRpcMethods>` (#2053) [e58bb22](https://github.com/solana-labs/solana-web3.js/commit/e58bb22), (#2056) [cbf8f38](https://github.com/solana-labs/solana-web3.js/commit/cbf8f38)
    -   RPC APIs can now be cluster-specific, ie. `SolanaRpcMethodsDevnet` (#2054) [5175d8a](https://github.com/solana-labs/solana-web3.js/commit/5175d8a)
    -   Added cluster-level RPC support for `@solana/web3.js` (#2055) [5a6335d](https://github.com/solana-labs/solana-web3.js/commit/5a6335d), (#2058) [0e03ca9](https://github.com/solana-labs/solana-web3.js/commit/0e03ca9)
    -   Added `@solana/signers`; an abstraction layer over signing messages and transactions in Solana (#1710) [7c29a1e](https://github.com/solana-labs/solana-web3.js/commit/7c29a1e)
    -   Updated codec such that only one instance of `Uint8Array` is created when encoding data. This allows `Encoders` to set data at different offsets and therefore enables non-linear serialization (#1865) [7800e3b](https://github.com/solana-labs/solana-web3.js/commit/7800e3b)
    -   Added `FixedSize*` and `VariableSize*` type variants for `Codecs`, `Encoders` and `Decoders` (#1883) [5e58d5c](https://github.com/solana-labs/solana-web3.js/commit/5e58d5c)
    -   Repaired some inaccurate RPC method signatures (#2137) [bb65ba9](https://github.com/solana-labs/solana-web3.js/commit/bb65ba9)
    -   Renamed transaction/airdrop sender factories with the ‘Factory’ suffix (#2130) [2d1d49c](https://github.com/solana-labs/solana-web3.js/commit/2d1d49c5467e5cb13871067c3dc0f9c87f007b9f)
    -   All code now throws coded exceptions defined in `@solana/errors` which can be refined using `isSolanaError()` and decoded in production using `npx @solana/errors decode` (#2160) [3524f2c](https://github.com/solana-labs/solana-web3.js/commit/3524f2c583dbc663cf6dcb73a01b0beed6cfd136), (#2161) [94944b](https://github.com/solana-labs/solana-web3.js/commit/94944b65b9d957ca95653d66dc1f4805f1a36740), (#2213) [8541c2e](https://github.com/solana-labs/solana-web3.js/commit/8541c2ef860535514fa39c4b9a6a75276417ffaa), (#2220) [c9b2705](https://github.com/solana-labs/solana-web3.js/commit/c9b2705318724bbccb05efdb1ddc088dd82921b2), (#2207) [75a18e3](https://github.com/solana-labs/solana-web3.js/commit/75a18e30524078ea1e8c07133fd6c75fad357db3), (#2224) [613053d](https://github.com/solana-labs/solana-web3.js/commit/613053deab85e5a8703e241ab138ec51cc54885a), (#2226) [94fee67](https://github.com/solana-labs/solana-web3.js/commit/94fee67560faae1f41aeddb2e7c3d0d9078ab851), (#2228) [483c674](https://github.com/solana-labs/solana-web3.js/commit/483c674a8b19f146c7dba5f1eb64182f01fdcdc4), (#2235) [803b2d8](https://github.com/solana-labs/solana-web3.js/commit/803b2d88e9e39cecf18f03b2130507dea7230423), (#2236) [cf9c20c](https://github.com/solana-labs/solana-web3.js/commit/cf9c20ceed7186f5af704ee646344c42d4ec0084), (#2242) [9084fdd](https://github.com/solana-labs/solana-web3.js/commit/9084fddec79eebb9c00c70738e43b4bfb01bf352), (#2245) [e374ac6](https://github.com/solana-labs/solana-web3.js/commit/e374ac67ad48a121470d125a1d08485b8b529b2b), (#2186) [546263e](https://github.com/solana-labs/solana-web3.js/commit/546263e251c8a7b08949b01d0d51fa2398dc7fff), (#2187) [bea19d2](https://github.com/solana-labs/solana-web3.js/commit/bea19d209ea6b02351c21a878200f87da1e9b4be), (#2188) [2e0ae95](https://github.com/solana-labs/solana-web3.js/commit/2e0ae95ffc2738ae047249c7f64c46a95e9573d1), (#2189) [7712fc3](https://github.com/solana-labs/solana-web3.js/commit/7712fc32ef33bfe7f235d85d3ba2308ba6884143), (#2190) [7d67615](https://github.com/solana-labs/solana-web3.js/commit/7d67615ac1ae771810dfc544ecc17d664a0fc11d), (#2191) [0ba8f21](https://github.com/solana-labs/solana-web3.js/commit/0ba8f216d962d61e0f653404c4a9289e59712cc2), (#2192) [91a360d](https://github.com/solana-labs/solana-web3.js/commit/91a360daf5c66ac0f1bae7347298f25ae89329b2), (#2202) [a71a2db](https://github.com/solana-labs/solana-web3.js/commit/a71a2db4c35136c8650b56985bbd33c5413e1bbd), (#2286) [52a5d3d](https://github.com/solana-labs/solana-web3.js/commit/52a5d3db60e702ccf77b4d17b8a3fd388e6e8584), and more
    -   You can now supply a custom Undici dispatcher for use with the `fetch` API when creating an RPC transport in Node (#2178) [a2fc5a3](https://github.com/solana-labs/solana-web3.js/commit/a2fc5a3fda252cccc6ee62f2f7163d1578a20113)
    -   Added functions to assert a value is an `IInstructionWithAccounts` and IInstructionWithData` (#2212) [07c30c1](https://github.com/solana-labs/solana-web3.js/commit/07c30c14c7d5efd6121290db62fa40371f108778)
    -   Added a function to assert an instruction is for a given program (#2234) [fb655dd](https://github.com/solana-labs/solana-web3.js/commit/fb655ddd217e4c4f55c5c8a81a08177e20ef5431)
    -   You can now create an RPC using only a URL (#2238) [cd0b6c6](https://github.com/solana-labs/solana-web3.js/commit/cd0b6c616ded7d1fdee33e33d3e44ce9bce48cef), (#2239) [fc11993](https://github.com/solana-labs/solana-web3.js/commit/fc119937ade7e46f487c99f254ff5a874e524c2c)
    -   You can now resize codec with the `resizeCodec` helper (#2293) [606de63](https://github.com/solana-labs/solana-web3.js/commit/606de638e21eebd0535806dee445e6d046cfb074)
    -   You can now skip bytes while writing byte buffers using the `offsetCodec` helper (#2294) [09d8cc8](https://github.com/solana-labs/solana-web3.js/commit/09d8cc815d133d70da0db93c9a0c0092e0d9a929)
    -   You can now now pad the beginning or end of byte buffers using the `padLeftCodec` and `padRightCodec` helpers (#2314) [f9509c7](https://github.com/solana-labs/solana-web3.js/commit/f9509c77dd6ec92357edbbe18acbb76c5a33e4b2)
    -   Added a new `@solana/sysvars` package for fetching, decoding, and building transactions with sysvar accounts (#2041)

-   Updated dependencies [[`0546a8c`](https://github.com/solana-labs/solana-web3.js/commit/0546a8ce95b6852324d58bb32ac31480506193a7)]:
    -   @solana/accounts@2.0.0-preview.2
    -   @solana/addresses@2.0.0-preview.2
    -   @solana/codecs@2.0.0-preview.2
    -   @solana/errors@2.0.0-preview.2
    -   @solana/functional@2.0.0-preview.2
    -   @solana/instructions@2.0.0-preview.2
    -   @solana/keys@2.0.0-preview.2
    -   @solana/programs@2.0.0-preview.2
    -   @solana/rpc@2.0.0-preview.2
    -   @solana/rpc-parsed-types@2.0.0-preview.2
    -   @solana/rpc-subscriptions@2.0.0-preview.2
    -   @solana/rpc-types@2.0.0-preview.2
    -   @solana/signers@2.0.0-preview.2
    -   @solana/transaction-confirmation@2.0.0-preview.2
    -   @solana/transactions@2.0.0-preview.2

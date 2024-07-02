---
'@solana/web3.js-experimental': major
---

This version of the `@solana/web3.js` Technology Preview fixes a bug with the default RPC transport, adds a utility that you can use to get an estimate of a transaction message's compute unit cost, and introduces `@solana/react` hooks for interacting with Wallet Standard wallets.

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

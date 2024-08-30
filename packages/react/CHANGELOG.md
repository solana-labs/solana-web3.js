# @solana/react

## 2.0.0-rc.2

### Patch Changes

-   [#3137](https://github.com/solana-labs/solana-web3.js/pull/3137) [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a) Thanks [@mcintyre94](https://github.com/mcintyre94)! - Add edge-light to package exports

-   Updated dependencies [[`38faba0`](https://github.com/solana-labs/solana-web3.js/commit/38faba05fab479ddbd95d0e211744d203f8aa823), [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a), [`0158b31`](https://github.com/solana-labs/solana-web3.js/commit/0158b3181ed96996f269f3bff689f76411e460b3)]:
    -   @solana/errors@2.0.0-rc.2
    -   @solana/transactions@2.0.0-rc.2
    -   @solana/addresses@2.0.0-rc.2
    -   @solana/promises@2.0.0-rc.2
    -   @solana/signers@2.0.0-rc.2
    -   @solana/keys@2.0.0-rc.2

## 2.0.0-rc.1

### Patch Changes

-   Updated dependencies [[`7d310f6`](https://github.com/solana-labs/solana-web3.js/commit/7d310f6f9cd7d02fca4d6f8e311b857c9dd84e61), [`1ad523d`](https://github.com/solana-labs/solana-web3.js/commit/1ad523dc5792d9152a66e9dc2b83294e3eba4db0), [`b4bf318`](https://github.com/solana-labs/solana-web3.js/commit/b4bf318d7d4bdd639e4c126c70350993a8540fe8), [`f2bb4e8`](https://github.com/solana-labs/solana-web3.js/commit/f2bb4e8c7f7efd049cb1c3810291c99e9293c25d), [`f9a8446`](https://github.com/solana-labs/solana-web3.js/commit/f9a84460670a97d4ab6514b28fe0d29c6fac3302)]:
    -   @solana/keys@2.0.0-rc.1
    -   @solana/signers@2.0.0-rc.1
    -   @solana/promises@2.0.0-rc.1
    -   @solana/transactions@2.0.0-rc.1
    -   @solana/addresses@2.0.0-rc.1
    -   @solana/errors@2.0.0-rc.1

## 2.0.0-rc.0

### Minor Changes

-   [#2928](https://github.com/solana-labs/solana-web3.js/pull/2928) [`bac3747`](https://github.com/solana-labs/solana-web3.js/commit/bac37479dcfad3da86ccd01da5095759f449eb3d) Thanks [@steveluscher](https://github.com/steveluscher)! - Added a `useSignIn` hook that, given a `UiWallet` or `UiWalletAccount`, returns a function that you can call to trigger a wallet's [&lsquo;Sign In With Solana&rsquo;](https://phantom.app/learn/developers/sign-in-with-solana) feature.

    #### Example

    ```tsx
    import { useSignIn } from '@solana/react';

    function SignInButton({ wallet }) {
        const csrfToken = useCsrfToken();
        const signIn = useSignIn(wallet);
        return (
            <button
                onClick={async () => {
                    try {
                        const { account, signedMessage, signature } = await signIn({
                            requestId: csrfToken,
                        });
                        // Authenticate the user, typically on the server, by verifying that
                        // `signedMessage` was signed by the person who holds the private key for
                        // `account.publicKey`.
                        //
                        // Authorize the user, also on the server, by decoding `signedMessage` as the
                        // text of a Sign In With Solana message, verifying that it was not modified
                        // from the values your application expects, and that its content is sufficient
                        // to grant them access.
                        window.alert(`You are now signed in with the address ${account.address}`);
                    } catch (e) {
                        console.error('Failed to sign in', e);
                    }
                }}
            >
                Sign In
            </button>
        );
    }
    ```

### Patch Changes

-   Updated dependencies [[`677a9c4`](https://github.com/solana-labs/solana-web3.js/commit/677a9c4eb88a8ac6a9ede8d82f367c5ac8d69ff4)]:
    -   @solana/errors@2.0.0-rc.0
    -   @solana/signers@2.0.0-rc.0
    -   @solana/transactions@2.0.0-rc.0
    -   @solana/addresses@2.0.0-rc.0
    -   @solana/keys@2.0.0-rc.0

## 2.0.0-preview.4

### Patch Changes

-   [#2795](https://github.com/solana-labs/solana-web3.js/pull/2795) [`ce876d9`](https://github.com/solana-labs/solana-web3.js/commit/ce876d99f04d539292abd810acd77a319c52f50d) Thanks [@steveluscher](https://github.com/steveluscher)! - Added React hooks to which you can pass a Wallet Standard `UiWalletAccount` and obtain a `MessageModifyingSigner`, `TransactionModifyingSigner`, or `TransactionSendingSigner` for use in constructing, signing, and sending Solana transactions and messages

-   [#2772](https://github.com/solana-labs/solana-web3.js/pull/2772) [`8fe4551`](https://github.com/solana-labs/solana-web3.js/commit/8fe4551217a3ad8bfdcd1609ac7b23e8fd044c72) Thanks [@steveluscher](https://github.com/steveluscher)! - Added a series of React hooks to which you can pass a Wallet Standard `UiWalletAccount` to extract its `signMessage`, `signTransaction`, and `signAndSendTransaction` features

-   Updated dependencies [[`4f19842`](https://github.com/solana-labs/solana-web3.js/commit/4f198423997d28d927f982333d268e19940656df), [`cec9048`](https://github.com/solana-labs/solana-web3.js/commit/cec9048b2f83535df7e499db5488c336981dfb5a), [`be36bab`](https://github.com/solana-labs/solana-web3.js/commit/be36babd752b1c987a2f53b4ff83ac8c045a3418), [`cb49bfa`](https://github.com/solana-labs/solana-web3.js/commit/cb49bfa28f412376a41e758eeda59e7e90983147), [`367b8ad`](https://github.com/solana-labs/solana-web3.js/commit/367b8ad0cce55a916abfb0125f36b6e844333b2b), [`22a34aa`](https://github.com/solana-labs/solana-web3.js/commit/22a34aa08d1be7e9b43ccfea94a99eaa2694e491)]:
    -   @solana/errors@2.0.0-preview.4
    -   @solana/signers@2.0.0-preview.4
    -   @solana/keys@2.0.0-preview.4
    -   @solana/transactions@2.0.0-preview.4
    -   @solana/addresses@2.0.0-preview.4

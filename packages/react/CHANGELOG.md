# @solana/react

## 2.1.0

### Patch Changes

- [#3552](https://github.com/solana-labs/solana-web3.js/pull/3552) [`1adf435`](https://github.com/solana-labs/solana-web3.js/commit/1adf435cfc724303f64e509a6fda144ec8f5019d) Thanks [@leantOnSol](https://github.com/leantOnSol)! - A two-versions-old version of Node LTS is now specified everywhere via the `engines` field, including the one in the root of the `pnpm` workspace, and engine-strictness is delegated to the `.npmrc` files.

- Updated dependencies [[`1adf435`](https://github.com/solana-labs/solana-web3.js/commit/1adf435cfc724303f64e509a6fda144ec8f5019d), [`5af7f20`](https://github.com/solana-labs/solana-web3.js/commit/5af7f2013135a79893a0f190a905c6dd077ac38c), [`704d8a2`](https://github.com/solana-labs/solana-web3.js/commit/704d8a220592a5a472bd7726013814b50c991f5b)]:
    - @solana/addresses@2.1.0
    - @solana/errors@2.1.0
    - @solana/keys@2.1.0
    - @solana/signers@2.1.0
    - @solana/transactions@2.1.0
    - @solana/promises@2.1.0

## 2.0.0

### Minor Changes

- [#2928](https://github.com/solana-labs/solana-web3.js/pull/2928) [`bac3747`](https://github.com/solana-labs/solana-web3.js/commit/bac37479dcfad3da86ccd01da5095759f449eb3d) Thanks [@steveluscher](https://github.com/steveluscher)! - Added a `useSignIn` hook that, given a `UiWallet` or `UiWalletAccount`, returns a function that you can call to trigger a wallet's [&lsquo;Sign In With Solana&rsquo;](https://phantom.app/learn/developers/sign-in-with-solana) feature.

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

- [#2795](https://github.com/solana-labs/solana-web3.js/pull/2795) [`ce876d9`](https://github.com/solana-labs/solana-web3.js/commit/ce876d99f04d539292abd810acd77a319c52f50d) Thanks [@steveluscher](https://github.com/steveluscher)! - Added React hooks to which you can pass a Wallet Standard `UiWalletAccount` and obtain a `MessageModifyingSigner`, `TransactionModifyingSigner`, or `TransactionSendingSigner` for use in constructing, signing, and sending Solana transactions and messages

- [#2772](https://github.com/solana-labs/solana-web3.js/pull/2772) [`8fe4551`](https://github.com/solana-labs/solana-web3.js/commit/8fe4551217a3ad8bfdcd1609ac7b23e8fd044c72) Thanks [@steveluscher](https://github.com/steveluscher)! - Added a series of React hooks to which you can pass a Wallet Standard `UiWalletAccount` to extract its `signMessage`, `signTransaction`, and `signAndSendTransaction` features

- [#3541](https://github.com/solana-labs/solana-web3.js/pull/3541) [`135dc5a`](https://github.com/solana-labs/solana-web3.js/commit/135dc5ad43f286380a4c3a689668016f0d7945f4) Thanks [@steveluscher](https://github.com/steveluscher)! - Drop the Release Candidate label and publish `@solana/web3.js` at version 2.0.0

- [#3137](https://github.com/solana-labs/solana-web3.js/pull/3137) [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a) Thanks [@mcintyre94](https://github.com/mcintyre94)! - The build is now compatible with the Vercel Edge runtime and Cloudflare Workers through the addition of `edge-light` and `workerd` to the package exports.

- Updated dependencies [[`9370133`](https://github.com/solana-labs/solana-web3.js/commit/9370133e414bfa863517248d97905449e9a867eb), [`31916ae`](https://github.com/solana-labs/solana-web3.js/commit/31916ae5d4fb29f239c63252a59745e33a6979ea), [`292487d`](https://github.com/solana-labs/solana-web3.js/commit/292487da00ee57350e8faf49ccf961203aed6403), [`7d310f6`](https://github.com/solana-labs/solana-web3.js/commit/7d310f6f9cd7d02fca4d6f8e311b857c9dd84e61), [`1ad523d`](https://github.com/solana-labs/solana-web3.js/commit/1ad523dc5792d9152a66e9dc2b83294e3eba4db0), [`89f399d`](https://github.com/solana-labs/solana-web3.js/commit/89f399d474abac463b1daaa864c88305d7b8c21f), [`ebb03cd`](https://github.com/solana-labs/solana-web3.js/commit/ebb03cd8270027db957d4cecc7d2374d468d4ccb), [`002cc38`](https://github.com/solana-labs/solana-web3.js/commit/002cc38a99cd4c91c7ce9023e1b4fb28f7e10832), [`ce1be3f`](https://github.com/solana-labs/solana-web3.js/commit/ce1be3fe37ea9b744fd836f3d6c2c8e5e31efd77), [`82cf07f`](https://github.com/solana-labs/solana-web3.js/commit/82cf07f4e905f6b056e70a0463a94222c3e7cadd), [`2d54650`](https://github.com/solana-labs/solana-web3.js/commit/2d5465018d8060eceb00efbf4f718df26d145199), [`135dc5a`](https://github.com/solana-labs/solana-web3.js/commit/135dc5ad43f286380a4c3a689668016f0d7945f4), [`bef9604`](https://github.com/solana-labs/solana-web3.js/commit/bef960435eb2303395bfa76e44f84d3348c5722d), [`7e86583`](https://github.com/solana-labs/solana-web3.js/commit/7e86583da68695076ec62033f3fe078b3890f026), [`4f19842`](https://github.com/solana-labs/solana-web3.js/commit/4f198423997d28d927f982333d268e19940656df), [`677a9c4`](https://github.com/solana-labs/solana-web3.js/commit/677a9c4eb88a8ac6a9ede8d82f367c5ac8d69ff4), [`38faba0`](https://github.com/solana-labs/solana-web3.js/commit/38faba05fab479ddbd95d0e211744d203f8aa823), [`2e5af9f`](https://github.com/solana-labs/solana-web3.js/commit/2e5af9f1a9410f15108863342b48225fdf9a0c83), [`cec9048`](https://github.com/solana-labs/solana-web3.js/commit/cec9048b2f83535df7e499db5488c336981dfb5a), [`b4bf318`](https://github.com/solana-labs/solana-web3.js/commit/b4bf318d7d4bdd639e4c126c70350993a8540fe8), [`e3e82d9`](https://github.com/solana-labs/solana-web3.js/commit/e3e82d909825e958ae234ed18500335a621773bd), [`2798061`](https://github.com/solana-labs/solana-web3.js/commit/27980617e4f8d34dbc7b6da4507e4bca68a68090), [`54d68c4`](https://github.com/solana-labs/solana-web3.js/commit/54d68c482feebf4e62a9896b3badd77dab615941), [`be36bab`](https://github.com/solana-labs/solana-web3.js/commit/be36babd752b1c987a2f53b4ff83ac8c045a3418), [`cb49bfa`](https://github.com/solana-labs/solana-web3.js/commit/cb49bfa28f412376a41e758eeda59e7e90983147), [`f2bb4e8`](https://github.com/solana-labs/solana-web3.js/commit/f2bb4e8c7f7efd049cb1c3810291c99e9293c25d), [`288029a`](https://github.com/solana-labs/solana-web3.js/commit/288029a55a5eeb863b6df960027a59214ffc37f1), [`4ae78f5`](https://github.com/solana-labs/solana-web3.js/commit/4ae78f5cdddd6772b25351beb813483d4e52cea6), [`478443f`](https://github.com/solana-labs/solana-web3.js/commit/478443fedac06678f12e8ac285aa7c7fcf503ee8), [`367b8ad`](https://github.com/solana-labs/solana-web3.js/commit/367b8ad0cce55a916abfb0125f36b6e844333b2b), [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a), [`4decebb`](https://github.com/solana-labs/solana-web3.js/commit/4decebb9b619972f49c740323b59cf470696e105), [`d4965ec`](https://github.com/solana-labs/solana-web3.js/commit/d4965ece9abaf81e3006442db15f3f77d89a622c), [`0158b31`](https://github.com/solana-labs/solana-web3.js/commit/0158b3181ed96996f269f3bff689f76411e460b3), [`22a34aa`](https://github.com/solana-labs/solana-web3.js/commit/22a34aa08d1be7e9b43ccfea94a99eaa2694e491), [`f9a8446`](https://github.com/solana-labs/solana-web3.js/commit/f9a84460670a97d4ab6514b28fe0d29c6fac3302), [`125fc15`](https://github.com/solana-labs/solana-web3.js/commit/125fc1540cfbc0a4afdba5aabac0884c750e58c1)]:
    - @solana/errors@2.0.0
    - @solana/transactions@2.0.0
    - @solana/addresses@2.0.0
    - @solana/keys@2.0.0
    - @solana/signers@2.0.0
    - @solana/promises@2.0.0

## 2.0.0-rc.4

### Patch Changes

- Updated dependencies [[`2798061`](https://github.com/solana-labs/solana-web3.js/commit/27980617e4f8d34dbc7b6da4507e4bca68a68090)]:
    - @solana/errors@2.0.0-rc.4
    - @solana/addresses@2.0.0-rc.4
    - @solana/keys@2.0.0-rc.4
    - @solana/signers@2.0.0-rc.4
    - @solana/transactions@2.0.0-rc.4
    - @solana/promises@2.0.0-rc.4

## 2.0.0-rc.3

### Patch Changes

- Updated dependencies []:
    - @solana/addresses@2.0.0-rc.3
    - @solana/errors@2.0.0-rc.3
    - @solana/keys@2.0.0-rc.3
    - @solana/promises@2.0.0-rc.3
    - @solana/signers@2.0.0-rc.3
    - @solana/transactions@2.0.0-rc.3

## 2.0.0-rc.2

### Patch Changes

- [#3137](https://github.com/solana-labs/solana-web3.js/pull/3137) [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a) Thanks [@mcintyre94](https://github.com/mcintyre94)! - The build is now compatible with the Vercel Edge runtime and Cloudflare Workers through the addition of `edge-light` and `workerd` to the package exports.

- Updated dependencies [[`292487d`](https://github.com/solana-labs/solana-web3.js/commit/292487da00ee57350e8faf49ccf961203aed6403), [`38faba0`](https://github.com/solana-labs/solana-web3.js/commit/38faba05fab479ddbd95d0e211744d203f8aa823), [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a), [`4decebb`](https://github.com/solana-labs/solana-web3.js/commit/4decebb9b619972f49c740323b59cf470696e105), [`d4965ec`](https://github.com/solana-labs/solana-web3.js/commit/d4965ece9abaf81e3006442db15f3f77d89a622c), [`0158b31`](https://github.com/solana-labs/solana-web3.js/commit/0158b3181ed96996f269f3bff689f76411e460b3)]:
    - @solana/addresses@2.0.0-rc.2
    - @solana/errors@2.0.0-rc.2
    - @solana/transactions@2.0.0-rc.2
    - @solana/promises@2.0.0-rc.2
    - @solana/signers@2.0.0-rc.2
    - @solana/keys@2.0.0-rc.2

## 2.0.0-rc.1

### Patch Changes

- Updated dependencies [[`7d310f6`](https://github.com/solana-labs/solana-web3.js/commit/7d310f6f9cd7d02fca4d6f8e311b857c9dd84e61), [`1ad523d`](https://github.com/solana-labs/solana-web3.js/commit/1ad523dc5792d9152a66e9dc2b83294e3eba4db0), [`b4bf318`](https://github.com/solana-labs/solana-web3.js/commit/b4bf318d7d4bdd639e4c126c70350993a8540fe8), [`f2bb4e8`](https://github.com/solana-labs/solana-web3.js/commit/f2bb4e8c7f7efd049cb1c3810291c99e9293c25d), [`f9a8446`](https://github.com/solana-labs/solana-web3.js/commit/f9a84460670a97d4ab6514b28fe0d29c6fac3302)]:
    - @solana/keys@2.0.0-rc.1
    - @solana/signers@2.0.0-rc.1
    - @solana/promises@2.0.0-rc.1
    - @solana/transactions@2.0.0-rc.1
    - @solana/addresses@2.0.0-rc.1
    - @solana/errors@2.0.0-rc.1

## 2.0.0-rc.0

### Minor Changes

- [#2928](https://github.com/solana-labs/solana-web3.js/pull/2928) [`bac3747`](https://github.com/solana-labs/solana-web3.js/commit/bac37479dcfad3da86ccd01da5095759f449eb3d) Thanks [@steveluscher](https://github.com/steveluscher)! - Added a `useSignIn` hook that, given a `UiWallet` or `UiWalletAccount`, returns a function that you can call to trigger a wallet's [&lsquo;Sign In With Solana&rsquo;](https://phantom.app/learn/developers/sign-in-with-solana) feature.

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

- Updated dependencies [[`677a9c4`](https://github.com/solana-labs/solana-web3.js/commit/677a9c4eb88a8ac6a9ede8d82f367c5ac8d69ff4)]:
    - @solana/errors@2.0.0-rc.0
    - @solana/signers@2.0.0-rc.0
    - @solana/transactions@2.0.0-rc.0
    - @solana/addresses@2.0.0-rc.0
    - @solana/keys@2.0.0-rc.0

## 2.0.0-preview.4

### Patch Changes

- [#2795](https://github.com/solana-labs/solana-web3.js/pull/2795) [`ce876d9`](https://github.com/solana-labs/solana-web3.js/commit/ce876d99f04d539292abd810acd77a319c52f50d) Thanks [@steveluscher](https://github.com/steveluscher)! - Added React hooks to which you can pass a Wallet Standard `UiWalletAccount` and obtain a `MessageModifyingSigner`, `TransactionModifyingSigner`, or `TransactionSendingSigner` for use in constructing, signing, and sending Solana transactions and messages

- [#2772](https://github.com/solana-labs/solana-web3.js/pull/2772) [`8fe4551`](https://github.com/solana-labs/solana-web3.js/commit/8fe4551217a3ad8bfdcd1609ac7b23e8fd044c72) Thanks [@steveluscher](https://github.com/steveluscher)! - Added a series of React hooks to which you can pass a Wallet Standard `UiWalletAccount` to extract its `signMessage`, `signTransaction`, and `signAndSendTransaction` features

- Updated dependencies [[`4f19842`](https://github.com/solana-labs/solana-web3.js/commit/4f198423997d28d927f982333d268e19940656df), [`cec9048`](https://github.com/solana-labs/solana-web3.js/commit/cec9048b2f83535df7e499db5488c336981dfb5a), [`be36bab`](https://github.com/solana-labs/solana-web3.js/commit/be36babd752b1c987a2f53b4ff83ac8c045a3418), [`cb49bfa`](https://github.com/solana-labs/solana-web3.js/commit/cb49bfa28f412376a41e758eeda59e7e90983147), [`367b8ad`](https://github.com/solana-labs/solana-web3.js/commit/367b8ad0cce55a916abfb0125f36b6e844333b2b), [`22a34aa`](https://github.com/solana-labs/solana-web3.js/commit/22a34aa08d1be7e9b43ccfea94a99eaa2694e491)]:
    - @solana/errors@2.0.0-preview.4
    - @solana/signers@2.0.0-preview.4
    - @solana/keys@2.0.0-preview.4
    - @solana/transactions@2.0.0-preview.4
    - @solana/addresses@2.0.0-preview.4

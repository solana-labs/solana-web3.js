---
'@solana/react': minor
---

Added a `useSignIn` hook that, given a `UiWallet` or `UiWalletAccount`, returns a function that you can call to trigger a wallet's [&lsquo;Sign In With Solana&rsquo;](https://phantom.app/learn/developers/sign-in-with-solana) feature.

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

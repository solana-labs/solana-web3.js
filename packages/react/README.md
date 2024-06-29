[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/react/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/react/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/react/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/react

This package contains React hooks for building Solana apps.

## Hooks

### `useWalletAccountMessageSigner(uiWalletAccount)`

Given a `UiWalletAccount`, this hook returns an object that conforms to the `MessageModifyingSigner` interface of `@solana/signers`.

#### Example

```tsx
import { useWalletAccountMessageSigner } from '@solana/react';
import { createSignableMessage } from '@solana/signers';

function SignMessageButton({ account, text }) {
    const messageSigner = useWalletAccountMessageSigner(account);
    return (
        <button
            onClick={async () => {
                try {
                    const signableMessage = createSignableMessage(text);
                    const [signedMessage] = await messageSigner.modifyAndSignMessages([signableMessage]);
                    const messageWasModified = signableMessage.content !== signedMessage.content;
                    const signatureBytes = signedMessage.signatures[messageSigner.address];
                    window.alert(
                        `Signature bytes: ${signatureBytes.toString()}${
                            messageWasModified ? ' (message was modified)' : ''
                        }`,
                    );
                } catch (e) {
                    console.error('Failed to sign message', e);
                }
            }}
        >
            Sign Message: {text}
        </button>
    );
}
```

> [!NOTE]
> The type `MessageModifyingSigner` is returned from this hook instead of `MessageSigner` or `MessagePartialSigner`. This is a conservative assumption based on the fact that your application can not control whether or not the wallet will modify the message before signing it.

### `useWalletAccountTransactionSigner(uiWalletAccount, chain)`

Given a `UiWalletAccount` and a chain that begins with `solana:`, this hook returns an object that conforms to the `TransactionModifyingSigner` interface of `@solana/signers`.

#### Example

```tsx
import { useWalletAccountTransactionSigner } from '@solana/react';

function SignTransactionButton({ account, transaction }) {
    const transactionSigner = useWalletAccountTransactionSigner(account, 'solana:devnet');
    return (
        <button
            onClick={async () => {
                try {
                    const [{ signatures }] = await transactionSigner.modifyAndSignTransactions([transaction]);
                    const signatureBytes = signatures[transactionSigner.address];
                    window.alert(`Signature bytes: ${signatureBytes.toString()}`);
                } catch (e) {
                    console.error('Failed to sign transaction', e);
                }
            }}
        >
            Sign Transaction
        </button>
    );
}
```

> [!NOTE]
> The type `TransactionModifyingSigner` is returned from this hook instead of `TransactionSigner` or `TransactionPartialSigner`. This is a conservative assumption based on the fact that your application can not control whether or not the wallet will modify the transaction before signing it (eg. to add guard instructions, or a priority fee budget).

### `useWalletAccountTransactionSendingSigner(uiWalletAccount, chain)`

Given a `UiWalletAccount` and a chain that begins with `solana:`, this hook returns an object that conforms to the `TransactionSendingSigner` interface of `@solana/signers`.

#### Example

```tsx
import { useWalletAccountTransactionSendingSigner } from '@solana/react';
import {
    appendTransactionMessageInstruction,
    createSolanaRpc,
    getBase58Decoder,
    pipe,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signAndSendTransactionMessageWithSigners,
} from '@solana/web3.js';

function RecordMemoButton({ account, rpc, text }) {
    const signer = useWalletAccountTransactionSendingSigner(account, 'solana:devnet');
    return (
        <button
            onClick={async () => {
                try {
                    const { value: latestBlockhash } = await createSolanaRpc('https://api.devnet.solana.com')
                        .getLatestBlockhash()
                        .send();
                    const message = pipe(
                        createTransactionMessage({ version: 'legacy' }),
                        m => setTransactionMessageFeePayerSigner(signer, m),
                        m => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
                        m => appendTransactionMessageInstruction(getAddMemoInstruction({ memo: text }), m),
                    );
                    const signatureBytes = await signAndSendTransactionMessageWithSigners(message);
                    const base58Signature = getBase58Decoder().decode(signature);
                    window.alert(`View transaction: https://explorer.solana.com/tx/${base58Signature}?cluster=devnet`);
                } catch (e) {
                    console.error('Failed to record memo', e);
                }
            }}
        >
            Record Memo
        </button>
    );
}
```

### `useSignMessage(uiWalletAccount)`

Given a `UiWalletAccount`, this hook returns a function you can call to sign a byte array.

#### Arguments

A config object with the following properties:

-   `message`: A `Uint8Array` of bytes to sign

#### Returns

An object with the following properties:

-   `signature`: The 64-byte Ed25519 signature as a `Uint8Array`
-   `signedMessage`: The `Uint8Array` of bytes signed by the wallet. These bytes might differ from the input bytes if the wallet modified the message

#### Example

```tsx
import { useSignMessage } from '@solana/react';

function SignMessageButton({ account, messageBytes }) {
    const signMessage = useSignMessage(account);
    return (
        <button
            onClick={async () => {
                try {
                    const { signature } = await signMessage({
                        message: messageBytes,
                    });
                    window.alert(`Signature bytes: ${signature.toString()}`);
                } catch (e) {
                    console.error('Failed to sign message', e);
                }
            }}
        >
            Sign Message
        </button>
    );
}
```

### `useSignTransaction(uiWalletAccount, chain)`

Given a `UiWalletAccount` and a chain that begins with `solana:`, this hook returns a function you can call to sign a serialized transaction.

#### Arguments

A config object with the following properties:

-   `options`: An object with the following properties:
    -   `minContextSlot`: A slot at which any blockhash/nonce in the transaction is known to exist. This may be used by the signer and/or RPC to determine the validity of the blockhashes/nonces it has observed.
-   `transaction`: A `Uint8Array` of bytes that conforms to the [Solana transaction schema](https://solana.com/docs/core/transactions#transaction)

#### Returns

An object with the following properties:

-   `signedTransaction`: A `Uint8Array` of bytes that conforms to the [Solana transaction schema](https://solana.com/docs/core/transactions#transaction)

#### Example

```tsx
import { useSignTransaction } from '@solana/react';

function SignTransactionButton({ account, transactionBytes }) {
    const signTransaction = useSignTransaction(account, 'solana:devnet');
    return (
        <button
            onClick={async () => {
                try {
                    const { signedTransaction } = await signTransaction({
                        transaction: transactionBytes,
                    });
                    window.alert(`Signed transaction bytes: ${signedTransaction.toString()}`);
                } catch (e) {
                    console.error('Failed to sign transaction', e);
                }
            }}
        >
            Sign Transaction
        </button>
    );
}
```

### `useSignAndSendTransaction(uiWalletAccount, chain)`

Given a `UiWalletAccount` and a chain that begins with `solana:`, this hook returns a function you can call to sign and send a serialized transaction.

#### Arguments

A config object with the following properties:

-   `options`: An object with the following properties:
    -   `minContextSlot`: A slot at which any blockhash/nonce in the transaction is known to exist. This may be used by the signer and/or RPC to determine the validity of the blockhashes/nonces it has observed.
-   `transaction`: A `Uint8Array` of bytes that conforms to the [Solana transaction schema](https://solana.com/docs/core/transactions#transaction)

#### Returns

That function returns an object with the following properties:

-   `signature`: A `Uint8Array` of bytes representing the signature of the sent transaction.

#### Example

```tsx
import { getBase58Decoder } from '@solana/codecs-strings';
import { useSignAndSendTransaction } from '@solana/react';

function SignAndSendTransactionButton({ account, transactionBytes }) {
    const signAndSendTransaction = useSignAndSendTransaction(account, 'solana:devnet');
    return (
        <button
            onClick={async () => {
                try {
                    const { signature } = await signAndSendTransaction({
                        transaction: transactionBytes,
                    });
                    const base58TransactionSignature = getBase58Decoder().decode(signature);
                    window.alert(
                        `View transaction: https://explorer.solana.com/tx/${base58TransactionSignature}?cluster=devnet`,
                    );
                } catch (e) {
                    console.error('Failed to send transaction', e);
                }
            }}
        >
            Sign and Send Transaction
        </button>
    );
}
```

import { Address, address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';
import { MessageModifyingSigner, SignableMessage } from '@solana/signers';
import type { UiWalletAccount } from '@wallet-standard/ui';
import { useMemo } from 'react';

import { getAbortablePromise } from './abortable-promise';
import { useSignMessage } from './useSignMessage';

/**
 * Returns an object that conforms to the `MessageModifyingSigner` interface of `@solana/signers`.
 */
export function useWalletAccountMessageSigner<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
): MessageModifyingSigner<TWalletAccount['address']> {
    const signMessage = useSignMessage(uiWalletAccount);
    return useMemo(
        () => ({
            address: address(uiWalletAccount.address),
            async modifyAndSignMessages(messages, config) {
                config?.abortSignal?.throwIfAborted();
                if (messages.length > 1) {
                    throw new SolanaError(SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED);
                }
                if (messages.length === 0) {
                    return messages;
                }
                const { content: originalMessage, signatures: originalSignatureMap } = messages[0];
                const input = {
                    message: originalMessage,
                };
                const { signedMessage, signature } = await getAbortablePromise(signMessage(input), config?.abortSignal);
                const messageWasModified =
                    originalMessage.length !== signedMessage.length ||
                    originalMessage.some((originalByte, ii) => originalByte !== signedMessage[ii]);
                const originalSignature = originalSignatureMap[uiWalletAccount.address as Address<string>] as
                    | SignatureBytes
                    | undefined;
                const signatureIsNew = !originalSignature?.every((originalByte, ii) => originalByte === signature[ii]);
                if (!signatureIsNew && !messageWasModified) {
                    // We already had this exact signature, and the message wasn't modified.
                    // Don't replace the existing message object.
                    return messages;
                }
                const nextSignatureMap = messageWasModified
                    ? { [uiWalletAccount.address]: signature }
                    : { ...originalSignatureMap, [uiWalletAccount.address]: signature };
                const outputMessages = Object.freeze([
                    Object.freeze({
                        content: signedMessage,
                        signatures: Object.freeze(nextSignatureMap),
                    }) as SignableMessage,
                ]);
                return outputMessages;
            },
        }),
        [uiWalletAccount, signMessage],
    );
}

import {
    SolanaSignMessage,
    SolanaSignMessageFeature,
    SolanaSignMessageInput,
    SolanaSignMessageOutput,
} from '@solana/wallet-standard-features';
import { getWalletAccountFeature, UiWalletAccount } from '@wallet-standard/ui';
import { getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from '@wallet-standard/ui-registry';
import { useCallback } from 'react';

type Input = Omit<SolanaSignMessageInput, 'account'>;
type Output = Omit<SolanaSignMessageOutput, 'signatureType'>;

/**
 * Returns a function you can call to sign a serialized transaction.
 */
export function useSignMessage<TWalletAccount extends UiWalletAccount>(
    ...config: Parameters<typeof useSignMessages<TWalletAccount>>
): (input: Input) => Promise<Output> {
    const signMessages = useSignMessages(...config);
    return useCallback(
        async input => {
            const [result] = await signMessages(input);
            return result;
        },
        [signMessages],
    );
}

function useSignMessages<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
): (...inputs: readonly Input[]) => Promise<readonly Output[]> {
    const signMessageFeature = getWalletAccountFeature(
        uiWalletAccount,
        SolanaSignMessage,
    ) as SolanaSignMessageFeature[typeof SolanaSignMessage];
    const account = getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWalletAccount);
    return useCallback(
        async (...inputs) => {
            const inputsWithAccount = inputs.map(input => ({ ...input, account }));
            const results = await signMessageFeature.signMessage(...inputsWithAccount);
            const resultsWithoutSignatureType = results.map(
                ({
                    signatureType: _, // Solana signatures are always of type `ed25519` so drop this property.
                    ...rest
                }) => rest,
            );
            return resultsWithoutSignatureType;
        },
        [signMessageFeature, account],
    );
}

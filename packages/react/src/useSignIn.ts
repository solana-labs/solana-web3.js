import { Address } from '@solana/addresses';
import {
    SolanaSignIn,
    SolanaSignInFeature,
    SolanaSignInInput,
    SolanaSignInOutput,
} from '@solana/wallet-standard-features';
import {
    getWalletAccountFeature,
    getWalletFeature,
    UiWallet,
    UiWalletAccount,
    UiWalletHandle,
} from '@wallet-standard/ui';
import {
    getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from '@wallet-standard/ui-registry';
import { useCallback } from 'react';

type Input = SolanaSignInInput;
type Output = Omit<SolanaSignInOutput, 'account' | 'signatureType'> &
    Readonly<{
        account: UiWalletAccount;
    }>;

/**
 * Returns a function you can call to sign in to a domain
 */
export function useSignIn(uiWalletAccount: UiWalletAccount): (input?: Omit<Input, 'address'>) => Promise<Output>;
export function useSignIn(uiWallet: UiWallet): (input?: Input) => Promise<Output>;
export function useSignIn(uiWalletHandle: UiWalletHandle): (input?: Input) => Promise<Output> {
    const signIns = useSignIns(uiWalletHandle);
    return useCallback(
        async input => {
            const [result] = await signIns(input);
            return result;
        },
        [signIns],
    );
}

function useSignIns(
    uiWalletHandle: UiWalletHandle,
): (...inputs: readonly (Input | undefined)[]) => Promise<readonly Output[]> {
    let signMessageFeature: SolanaSignInFeature[typeof SolanaSignIn];
    if ('address' in uiWalletHandle && typeof uiWalletHandle.address === 'string') {
        getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWalletHandle as UiWalletAccount);
        signMessageFeature = getWalletAccountFeature(
            uiWalletHandle as UiWalletAccount,
            SolanaSignIn,
        ) as SolanaSignInFeature[typeof SolanaSignIn];
    } else {
        signMessageFeature = getWalletFeature(uiWalletHandle, SolanaSignIn) as SolanaSignInFeature[typeof SolanaSignIn];
    }
    const wallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWalletHandle);
    return useCallback(
        async (...inputs) => {
            const inputsWithAddressAndChainId = inputs.map(input => ({
                ...input,
                // Prioritize the `UiWalletAccount` address if it exists.
                ...('address' in uiWalletHandle ? { address: uiWalletHandle.address as Address } : null),
            }));
            const results = await signMessageFeature.signIn(...inputsWithAddressAndChainId);
            const resultsWithoutSignatureType = results.map(
                ({
                    account,
                    signatureType: _, // Solana signatures are always of type `ed25519` so drop this property.
                    ...rest
                }) => ({
                    ...rest,
                    account: getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
                        wallet,
                        account,
                    ),
                }),
            );
            return resultsWithoutSignatureType;
        },
        [signMessageFeature, uiWalletHandle, wallet],
    );
}

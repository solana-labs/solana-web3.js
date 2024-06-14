import {
    SolanaSignAndSendTransaction,
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionInput,
    SolanaSignAndSendTransactionOutput,
} from '@solana/wallet-standard-features';
import {
    WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_CHAIN_UNSUPPORTED,
    WalletStandardError,
} from '@wallet-standard/errors';
import { getWalletAccountFeature, type UiWalletAccount } from '@wallet-standard/ui';
import { getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from '@wallet-standard/ui-registry';
import { useCallback } from 'react';

import { OnlySolanaChains } from './chain';

type Input = Readonly<
    Omit<SolanaSignAndSendTransactionInput, 'account' | 'chain' | 'options'> & {
        options?: Readonly<{
            minContextSlot?: bigint;
        }>;
    }
>;
type Output = SolanaSignAndSendTransactionOutput;

/**
 * Returns a function you can call to sign and send a serialized transaction.
 */
export function useSignAndSendTransaction<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
    chain: OnlySolanaChains<TWalletAccount['chains']>,
): (input: Input) => Promise<Output>;
export function useSignAndSendTransaction<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
    chain: `solana:${string}`,
): (input: Input) => Promise<Output>;
export function useSignAndSendTransaction<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
    chain: `solana:${string}`,
): (input: Input) => Promise<Output> {
    const signAndSendTransactions = useSignAndSendTransactions(uiWalletAccount, chain);
    return useCallback(
        async input => {
            const [result] = await signAndSendTransactions(input);
            return result;
        },
        [signAndSendTransactions],
    );
}

function useSignAndSendTransactions<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
    chain: `solana:${string}`,
): (...inputs: readonly Input[]) => Promise<readonly Output[]> {
    if (!uiWalletAccount.chains.includes(chain)) {
        throw new WalletStandardError(WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_CHAIN_UNSUPPORTED, {
            address: uiWalletAccount.address,
            chain,
            featureName: SolanaSignAndSendTransaction,
            supportedChains: [...uiWalletAccount.chains],
            supportedFeatures: [...uiWalletAccount.features],
        });
    }
    const signAndSendTransactionFeature = getWalletAccountFeature(
        uiWalletAccount,
        SolanaSignAndSendTransaction,
    ) as SolanaSignAndSendTransactionFeature[typeof SolanaSignAndSendTransaction];
    const account = getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWalletAccount);
    return useCallback(
        async (...inputs) => {
            const inputsWithChainAndAccount = inputs.map(({ options, ...rest }) => {
                const minContextSlot = options?.minContextSlot;
                return {
                    ...rest,
                    account,
                    chain,
                    ...(minContextSlot != null
                        ? {
                              options: {
                                  minContextSlot: Number(minContextSlot),
                              },
                          }
                        : null),
                };
            });
            const results = await signAndSendTransactionFeature.signAndSendTransaction(...inputsWithChainAndAccount);
            return results;
        },
        [account, chain, signAndSendTransactionFeature],
    );
}

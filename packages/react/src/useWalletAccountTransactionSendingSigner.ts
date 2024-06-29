import { address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';
import { TransactionSendingSigner } from '@solana/signers';
import { getTransactionEncoder } from '@solana/transactions';
import { UiWalletAccount } from '@wallet-standard/ui';
import { useMemo, useRef } from 'react';

import { getAbortablePromise } from './abortable-promise';
import { OnlySolanaChains } from './chain';
import { useSignAndSendTransaction } from './useSignAndSendTransaction';

/**
 * Returns an object that conforms to the `TransactionSendingSigner` interface of `@solana/signers`.
 */
export function useWalletAccountTransactionSendingSigner<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
    chain: OnlySolanaChains<TWalletAccount['chains']>,
): TransactionSendingSigner<TWalletAccount['address']>;
export function useWalletAccountTransactionSendingSigner<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
    chain: `solana:${string}`,
): TransactionSendingSigner<TWalletAccount['address']>;
export function useWalletAccountTransactionSendingSigner<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
    chain: `solana:${string}`,
): TransactionSendingSigner<TWalletAccount['address']> {
    const encoderRef = useRef<ReturnType<typeof getTransactionEncoder>>();
    const signAndSendTransaction = useSignAndSendTransaction(uiWalletAccount, chain);
    return useMemo(
        () => ({
            address: address(uiWalletAccount.address),
            async signAndSendTransactions(transactions, config = {}) {
                const { abortSignal, ...options } = config;
                abortSignal?.throwIfAborted();
                const transactionEncoder = (encoderRef.current ||= getTransactionEncoder());
                if (transactions.length > 1) {
                    throw new SolanaError(SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED);
                }
                if (transactions.length === 0) {
                    return [];
                }
                const [transaction] = transactions;
                const wireTransactionBytes = transactionEncoder.encode(transaction);
                const inputWithOptions = {
                    ...options,
                    transaction: wireTransactionBytes as Uint8Array,
                };
                const { signature } = await getAbortablePromise(signAndSendTransaction(inputWithOptions), abortSignal);
                return Object.freeze([signature as SignatureBytes]);
            },
        }),
        [signAndSendTransaction, uiWalletAccount.address],
    );
}

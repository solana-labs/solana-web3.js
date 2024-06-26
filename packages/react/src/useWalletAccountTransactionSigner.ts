import { address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED, SolanaError } from '@solana/errors';
import { TransactionModifyingSigner } from '@solana/signers';
import { getTransactionCodec } from '@solana/transactions';
import { UiWalletAccount } from '@wallet-standard/ui';
import { useMemo, useRef } from 'react';

import { getAbortablePromise } from './abortable-promise';
import { OnlySolanaChains } from './chain';
import { useSignTransaction } from './useSignTransaction';

/**
 * Returns an object that conforms to the `TransactionModifyingSigner` interface of
 * `@solana/signers`.
 */
export function useWalletAccountTransactionSigner<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
    chain: OnlySolanaChains<TWalletAccount['chains']>,
): TransactionModifyingSigner<TWalletAccount['address']>;
export function useWalletAccountTransactionSigner<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
    chain: `solana:${string}`,
): TransactionModifyingSigner<TWalletAccount['address']>;
export function useWalletAccountTransactionSigner<TWalletAccount extends UiWalletAccount>(
    uiWalletAccount: TWalletAccount,
    chain: `solana:${string}`,
): TransactionModifyingSigner<TWalletAccount['address']> {
    const encoderRef = useRef<ReturnType<typeof getTransactionCodec>>();
    const signTransaction = useSignTransaction(uiWalletAccount, chain);
    return useMemo(
        () => ({
            address: address(uiWalletAccount.address),
            async modifyAndSignTransactions(transactions, config = {}) {
                const { abortSignal, ...options } = config;
                abortSignal?.throwIfAborted();
                const transactionCodec = (encoderRef.current ||= getTransactionCodec());
                if (transactions.length > 1) {
                    throw new SolanaError(SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED);
                }
                if (transactions.length === 0) {
                    return transactions;
                }
                const [transaction] = transactions;
                const wireTransactionBytes = transactionCodec.encode(transaction);
                const inputWithOptions = {
                    ...options,
                    transaction: wireTransactionBytes as Uint8Array,
                };
                const { signedTransaction } = await getAbortablePromise(signTransaction(inputWithOptions), abortSignal);
                const decodedSignedTransaction = transactionCodec.decode(
                    signedTransaction,
                ) as (typeof transactions)[number];
                return Object.freeze([decodedSignedTransaction]);
            },
        }),
        [uiWalletAccount.address, signTransaction],
    );
}

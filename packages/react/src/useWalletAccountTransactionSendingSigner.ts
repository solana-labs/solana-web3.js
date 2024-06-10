import { address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';
import { TransactionSendingSigner } from '@solana/signers';
import { getTransactionEncoder, Transaction } from '@solana/transactions';
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
    extraConfig?: Readonly<{
        getOptions(transaction: Transaction): Readonly<{ minContextSlot?: bigint }> | undefined;
    }>,
): TransactionSendingSigner<TWalletAccount['address']> {
    const encoderRef = useRef<ReturnType<typeof getTransactionEncoder>>();
    const signAndSendTransaction = useSignAndSendTransaction(uiWalletAccount, chain);
    const getOptions = extraConfig?.getOptions;
    return useMemo(
        () => ({
            address: address(uiWalletAccount.address),
            async signAndSendTransactions(transactions, config) {
                config?.abortSignal?.throwIfAborted();
                const transactionEncoder = (encoderRef.current ||= getTransactionEncoder());
                if (transactions.length > 1) {
                    throw new SolanaError(SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED);
                }
                if (transactions.length === 0) {
                    return [];
                }
                const [transaction] = transactions;
                const wireTransactionBytes = transactionEncoder.encode(transaction);
                const options = getOptions ? getOptions(transaction) : undefined;
                const inputWithOptions = {
                    ...(options ? { options } : null),
                    transaction: wireTransactionBytes as Uint8Array,
                };
                const { signature } = await getAbortablePromise(
                    signAndSendTransaction(inputWithOptions),
                    config?.abortSignal,
                );
                return Object.freeze([signature as SignatureBytes]);
            },
        }),
        [getOptions, signAndSendTransaction, uiWalletAccount.address],
    );
}

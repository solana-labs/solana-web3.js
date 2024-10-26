import type { Signature } from '@solana/keys';
import type { Rpc, SendTransactionApi } from '@solana/rpc';
import { Commitment, commitmentComparator } from '@solana/rpc-types';
import {
    waitForDurableNonceTransactionConfirmation,
    waitForRecentTransactionConfirmation,
} from '@solana/transaction-confirmation';
import {
    FullySignedTransaction,
    getBase64EncodedWireTransaction,
    TransactionWithBlockhashLifetime,
    TransactionWithDurableNonceLifetime,
} from '@solana/transactions';

interface SendAndConfirmDurableNonceTransactionConfig
    extends SendTransactionBaseConfig,
        SendTransactionConfigWithoutEncoding {
    confirmDurableNonceTransaction: (
        config: Omit<
            Parameters<typeof waitForDurableNonceTransactionConfirmation>[0],
            'getNonceInvalidationPromise' | 'getRecentSignatureConfirmationPromise'
        >,
    ) => Promise<void>;
    transaction: FullySignedTransaction & TransactionWithDurableNonceLifetime;
}

interface SendAndConfirmTransactionWithBlockhashLifetimeConfig
    extends SendTransactionBaseConfig,
        SendTransactionConfigWithoutEncoding {
    confirmRecentTransaction: (
        config: Omit<
            Parameters<typeof waitForRecentTransactionConfirmation>[0],
            'getBlockHeightExceedencePromise' | 'getRecentSignatureConfirmationPromise'
        >,
    ) => Promise<void>;
    transaction: FullySignedTransaction & TransactionWithBlockhashLifetime;
}

interface SendTransactionBaseConfig extends SendTransactionConfigWithoutEncoding {
    abortSignal?: AbortSignal;
    commitment: Commitment;
    rpc: Rpc<SendTransactionApi>;
    transaction: FullySignedTransaction;
}

type SendTransactionConfigWithoutEncoding = Omit<
    NonNullable<Parameters<SendTransactionApi['sendTransaction']>[1]>,
    'encoding'
>;

function getSendTransactionConfigWithAdjustedPreflightCommitment(
    commitment: Commitment,
    config?: SendTransactionConfigWithoutEncoding,
): SendTransactionConfigWithoutEncoding | void {
    if (
        // The developer has supplied no value for `preflightCommitment`.
        !config?.preflightCommitment &&
        // The value of `commitment` is lower than the server default of `preflightCommitment`.
        commitmentComparator(commitment, 'finalized' /* default value of `preflightCommitment` */) < 0
    ) {
        return {
            ...config,
            // In the common case, it is unlikely that you want to simulate a transaction at
            // `finalized` commitment when your standard of commitment for confirming the
            // transaction is lower. Cap the simulation commitment level to the level of the
            // confirmation commitment.
            preflightCommitment: commitment,
        };
    }
    // The commitment at which the developer wishes to confirm the transaction is at least as
    // high as the commitment at which they want to simulate it. Honour the config as-is.
    return config;
}

export async function sendTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
    abortSignal,
    commitment,
    rpc,
    transaction,
    ...sendTransactionConfig
}: SendTransactionBaseConfig): Promise<Signature> {
    const base64EncodedWireTransaction = getBase64EncodedWireTransaction(transaction);
    return await rpc
        .sendTransaction(base64EncodedWireTransaction, {
            ...getSendTransactionConfigWithAdjustedPreflightCommitment(commitment, sendTransactionConfig),
            encoding: 'base64',
        })
        .send({ abortSignal });
}

export async function sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
    abortSignal,
    commitment,
    confirmDurableNonceTransaction,
    rpc,
    transaction,
    ...sendTransactionConfig
}: SendAndConfirmDurableNonceTransactionConfig): Promise<Signature> {
    const transactionSignature = await sendTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
        ...sendTransactionConfig,
        abortSignal,
        commitment,
        rpc,
        transaction,
    });
    await confirmDurableNonceTransaction({
        abortSignal,
        commitment,
        transaction,
    });
    return transactionSignature;
}

export async function sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT({
    abortSignal,
    commitment,
    confirmRecentTransaction,
    rpc,
    transaction,
    ...sendTransactionConfig
}: SendAndConfirmTransactionWithBlockhashLifetimeConfig): Promise<Signature> {
    const transactionSignature = await sendTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
        ...sendTransactionConfig,
        abortSignal,
        commitment,
        rpc,
        transaction,
    });
    await confirmRecentTransaction({
        abortSignal,
        commitment,
        transaction,
    });
    return transactionSignature;
}

import { Commitment, commitmentComparator } from '@solana/rpc-core';
import { GetAccountInfoApi } from '@solana/rpc-core/dist/types/rpc-methods/getAccountInfo';
import { GetSignatureStatusesApi } from '@solana/rpc-core/dist/types/rpc-methods/getSignatureStatuses';
import { SendTransactionApi } from '@solana/rpc-core/dist/types/rpc-methods/sendTransaction';
import { AccountNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/account-notifications';
import { SignatureNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/signature-notifications';
import { SlotNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/slot-notifications';
import { Rpc, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import {
    BaseTransaction,
    getBase64EncodedWireTransaction,
    IDurableNonceTransaction,
    IFullySignedTransaction,
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
    TransactionSignature,
} from '@solana/transactions';

import {
    createDefaultDurableNonceTransactionConfirmer,
    createDefaultRecentTransactionConfirmer,
} from './transaction-confirmation';

type DurableNonceTransactionSenderConfig = Readonly<{
    rpc: Rpc<GetAccountInfoApi & GetSignatureStatusesApi & SendTransactionApi>;
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi & AccountNotificationsApi>;
}>;

type RecentTransactionSenderConfig = Readonly<{
    rpc: Rpc<GetSignatureStatusesApi & SendTransactionApi>;
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi & SlotNotificationsApi>;
}>;

type SendableTransaction = BaseTransaction & ITransactionWithFeePayer & IFullySignedTransaction;
type SendTransactionConfig = Parameters<SendTransactionApi['sendTransaction']>[1];
type SendTransactionConfigWithoutEncoding = Omit<NonNullable<SendTransactionConfig>, 'encoding'>;

function getSendTransactionConfigWithAdjustedPreflightCommitment(
    commitment: Commitment,
    config?: SendTransactionConfigWithoutEncoding
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

async function sendTransaction_INTERNAL({
    abortSignal,
    commitment,
    rpc,
    transaction,
    sendTransactionConfig,
}: {
    abortSignal: AbortSignal;
    commitment: Commitment;
    rpc: Rpc<SendTransactionApi>;
    transaction: BaseTransaction &
        ITransactionWithFeePayer &
        (ITransactionWithBlockhashLifetime | IDurableNonceTransaction);
    sendTransactionConfig?: SendTransactionConfigWithoutEncoding;
}): Promise<TransactionSignature> {
    const base64EncodedWireTransaction = getBase64EncodedWireTransaction(transaction);
    return (await rpc
        .sendTransaction(base64EncodedWireTransaction, {
            ...getSendTransactionConfigWithAdjustedPreflightCommitment(commitment, sendTransactionConfig),
            encoding: 'base64',
        })
        .send({ abortSignal })) as unknown as TransactionSignature; // FIXME(#1709)
}

export function createDefaultDurableNonceTransactionSender({
    rpc,
    rpcSubscriptions,
}: DurableNonceTransactionSenderConfig) {
    const confirmDurableNonceTransaction = createDefaultDurableNonceTransactionConfirmer({
        rpc,
        rpcSubscriptions,
    });
    return async function sendDurableNonceTransaction(
        transaction: BaseTransaction & ITransactionWithFeePayer & IDurableNonceTransaction & IFullySignedTransaction,
        config: Omit<
            SendTransactionConfig &
                Readonly<{
                    abortSignal: AbortSignal;
                    commitment: Commitment;
                }>,
            'encoding'
        >
    ): Promise<void> {
        await sendAndConfirmDurableNonceTransaction({
            ...config,
            confirmDurableNonceTransaction,
            rpc,
            transaction,
        });
    };
}

export function createDefaultTransactionSender({ rpc, rpcSubscriptions }: RecentTransactionSenderConfig) {
    const confirmRecentTransaction = createDefaultRecentTransactionConfirmer({
        rpc,
        rpcSubscriptions,
    });
    return async function sendTransaction(
        transaction: SendableTransaction & ITransactionWithBlockhashLifetime,
        config: Omit<
            SendTransactionConfig &
                Readonly<{
                    abortSignal: AbortSignal;
                    commitment: Commitment;
                }>,
            'encoding'
        >
    ): Promise<void> {
        await sendAndConfirmTransaction({
            ...config,
            confirmRecentTransaction,
            rpc,
            transaction,
        });
    };
}

export async function sendAndConfirmDurableNonceTransaction({
    abortSignal,
    commitment,
    confirmDurableNonceTransaction,
    rpc,
    transaction,
    ...sendTransactionConfig
}: Omit<
    SendTransactionConfig &
        Readonly<{
            abortSignal: AbortSignal;
            commitment: Commitment;
            confirmDurableNonceTransaction: ReturnType<typeof createDefaultDurableNonceTransactionConfirmer>;
            rpc: Rpc<SendTransactionApi>;
            transaction: SendableTransaction & IDurableNonceTransaction;
        }>,
    'encoding'
>): Promise<TransactionSignature> {
    const transactionSignature = await sendTransaction_INTERNAL({
        abortSignal,
        commitment,
        rpc,
        sendTransactionConfig,
        transaction,
    });
    await confirmDurableNonceTransaction({
        abortSignal,
        commitment,
        transaction,
    });
    return transactionSignature;
}

export async function sendAndConfirmTransaction({
    abortSignal,
    commitment,
    confirmRecentTransaction,
    rpc,
    transaction,
    ...sendTransactionConfig
}: Omit<
    SendTransactionConfig &
        Readonly<{
            abortSignal: AbortSignal;
            commitment: Commitment;
            confirmRecentTransaction: ReturnType<typeof createDefaultRecentTransactionConfirmer>;
            rpc: Rpc<SendTransactionApi>;
            transaction: SendableTransaction & ITransactionWithBlockhashLifetime;
        }>,
    'encoding'
>): Promise<TransactionSignature> {
    const transactionSignature = await sendTransaction_INTERNAL({
        abortSignal,
        commitment,
        rpc,
        sendTransactionConfig,
        transaction,
    });
    await confirmRecentTransaction({
        abortSignal,
        commitment,
        transaction,
    });
    return transactionSignature;
}

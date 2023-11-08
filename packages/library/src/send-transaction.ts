import { Signature } from '@solana/keys';
import { SendTransactionApi } from '@solana/rpc-core/dist/types/rpc-methods/sendTransaction';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { Commitment, commitmentComparator } from '@solana/rpc-types';
import {
    BaseTransaction,
    getBase64EncodedWireTransaction,
    IDurableNonceTransaction,
    IFullySignedTransaction,
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
} from '@solana/transactions';

import {
    createDefaultDurableNonceTransactionConfirmer,
    createDefaultRecentTransactionConfirmer,
} from './transaction-confirmation';

interface DurableNonceTransactionSenderFactoryConfig {
    rpc: Rpc<SendTransactionApi> & Parameters<typeof createDefaultDurableNonceTransactionConfirmer>[0]['rpc'];
    rpcSubscriptions: Parameters<typeof createDefaultDurableNonceTransactionConfirmer>[0]['rpcSubscriptions'];
}

interface TransactionWithBlockhashLifetimeSenderFactoryConfig {
    rpc: Rpc<SendTransactionApi> & Parameters<typeof createDefaultRecentTransactionConfirmer>[0]['rpc'];
    rpcSubscriptions: Parameters<typeof createDefaultRecentTransactionConfirmer>[0]['rpcSubscriptions'];
}

interface SendAndConfirmDurableNonceTransactionConfig
    extends SendTransactionInternalConfig,
        SendTransactionConfigWithoutEncoding {
    confirmDurableNonceTransaction: ReturnType<typeof createDefaultDurableNonceTransactionConfirmer>;
    transaction: SendableTransaction & IDurableNonceTransaction;
}

interface SendAndConfirmTransactionWithBlockhashLifetimeConfig
    extends SendTransactionInternalConfig,
        SendTransactionConfigWithoutEncoding {
    confirmRecentTransaction: ReturnType<typeof createDefaultRecentTransactionConfirmer>;
    transaction: SendableTransaction & ITransactionWithBlockhashLifetime;
}

interface SendTransactionInternalConfig extends SendTransactionConfigWithoutEncoding {
    abortSignal?: AbortSignal;
    commitment: Commitment;
    rpc: Rpc<SendTransactionApi>;
    transaction: SendableTransaction;
}

type SendableTransaction = BaseTransaction &
    (ITransactionWithBlockhashLifetime | IDurableNonceTransaction) &
    ITransactionWithFeePayer &
    IFullySignedTransaction;
type SendTransactionConfig = Parameters<SendTransactionApi['sendTransaction']>[1];
interface SendTransactionConfigWithoutEncoding extends Omit<NonNullable<SendTransactionConfig>, 'encoding'> {}

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
    ...sendTransactionConfig
}: SendTransactionInternalConfig): Promise<Signature> {
    const base64EncodedWireTransaction = getBase64EncodedWireTransaction(transaction);
    return await rpc
        .sendTransaction(base64EncodedWireTransaction, {
            ...getSendTransactionConfigWithAdjustedPreflightCommitment(commitment, sendTransactionConfig),
            encoding: 'base64',
        })
        .send({ abortSignal });
}

export function createDefaultDurableNonceTransactionSender({
    rpc,
    rpcSubscriptions,
}: DurableNonceTransactionSenderFactoryConfig) {
    const confirmDurableNonceTransaction = createDefaultDurableNonceTransactionConfirmer({
        rpc,
        rpcSubscriptions,
    });
    return async function sendDurableNonceTransaction(
        transaction: BaseTransaction & ITransactionWithFeePayer & IDurableNonceTransaction & IFullySignedTransaction,
        config: Omit<
            Parameters<typeof sendAndConfirmDurableNonceTransaction>[0],
            'confirmDurableNonceTransaction' | 'rpc' | 'transaction'
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

export function createDefaultTransactionSender({
    rpc,
    rpcSubscriptions,
}: TransactionWithBlockhashLifetimeSenderFactoryConfig) {
    const confirmRecentTransaction = createDefaultRecentTransactionConfirmer({
        rpc,
        rpcSubscriptions,
    });
    return async function sendTransaction(
        transaction: SendableTransaction & ITransactionWithBlockhashLifetime,
        config: Omit<
            Parameters<typeof sendAndConfirmTransaction>[0],
            'confirmRecentTransaction' | 'rpc' | 'transaction'
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
}: SendAndConfirmDurableNonceTransactionConfig): Promise<Signature> {
    const transactionSignature = await sendTransaction_INTERNAL({
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

export async function sendAndConfirmTransaction({
    abortSignal,
    commitment,
    confirmRecentTransaction,
    rpc,
    transaction,
    ...sendTransactionConfig
}: SendAndConfirmTransactionWithBlockhashLifetimeConfig): Promise<Signature> {
    const transactionSignature = await sendTransaction_INTERNAL({
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

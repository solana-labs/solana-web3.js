import type { SendTransactionApi } from '@solana/rpc-core';
import type { Rpc } from '@solana/rpc-types';
import {
    BaseTransaction,
    IDurableNonceTransaction,
    IFullySignedTransaction,
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
} from '@solana/transactions';

import {
    SendableTransaction,
    sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT,
    sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT,
} from './send-transaction-internal';
import {
    createDefaultDurableNonceTransactionConfirmer,
    createDefaultRecentTransactionConfirmer,
} from './transaction-confirmation';

interface SendAndConfirmDurableNonceTransactionFactoryConfig {
    rpc: Rpc<SendTransactionApi> & Parameters<typeof createDefaultDurableNonceTransactionConfirmer>[0]['rpc'];
    rpcSubscriptions: Parameters<typeof createDefaultDurableNonceTransactionConfirmer>[0]['rpcSubscriptions'];
}

interface SendAndConfirmTransactionWithBlockhashLifetimeFactoryConfig {
    rpc: Rpc<SendTransactionApi> & Parameters<typeof createDefaultRecentTransactionConfirmer>[0]['rpc'];
    rpcSubscriptions: Parameters<typeof createDefaultRecentTransactionConfirmer>[0]['rpcSubscriptions'];
}

type SendAndConfirmTransactionWithBlockhashLifetimeFunction = (
    transaction: SendableTransaction & ITransactionWithBlockhashLifetime,
    config: Omit<
        Parameters<typeof sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT>[0],
        'confirmRecentTransaction' | 'rpc' | 'transaction'
    >,
) => Promise<void>;

type SendAndConfirmDurableNonceTransactionFunction = (
    transaction: BaseTransaction & ITransactionWithFeePayer & IDurableNonceTransaction & IFullySignedTransaction,
    config: Omit<
        Parameters<typeof sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT>[0],
        'confirmDurableNonceTransaction' | 'rpc' | 'transaction'
    >,
) => Promise<void>;

export function sendAndConfirmDurableNonceTransactionFactory({
    rpc,
    rpcSubscriptions,
}: SendAndConfirmDurableNonceTransactionFactoryConfig): SendAndConfirmDurableNonceTransactionFunction {
    const confirmDurableNonceTransaction = createDefaultDurableNonceTransactionConfirmer({
        rpc,
        rpcSubscriptions,
    });
    return async function sendAndConfirmDurableNonceTransaction(transaction, config) {
        await sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...config,
            confirmDurableNonceTransaction,
            rpc,
            transaction,
        });
    };
}

export function sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
}: SendAndConfirmTransactionWithBlockhashLifetimeFactoryConfig): SendAndConfirmTransactionWithBlockhashLifetimeFunction {
    const confirmRecentTransaction = createDefaultRecentTransactionConfirmer({
        rpc,
        rpcSubscriptions,
    });
    return async function sendAndConfirmTransaction(transaction, config) {
        await sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...config,
            confirmRecentTransaction,
            rpc,
            transaction,
        });
    };
}

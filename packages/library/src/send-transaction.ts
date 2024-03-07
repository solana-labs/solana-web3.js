import type { GetAccountInfoApi, GetEpochInfoApi, GetSignatureStatusesApi, Rpc, SendTransactionApi } from '@solana/rpc';
import type {
    AccountNotificationsApi,
    RpcSubscriptions,
    SignatureNotificationsApi,
    SlotNotificationsApi,
} from '@solana/rpc-subscriptions';
import {
    createBlockHeightExceedencePromiseFactory,
    createNonceInvalidationPromiseFactory,
    createRecentSignatureConfirmationPromiseFactory,
    waitForDurableNonceTransactionConfirmation,
    waitForRecentTransactionConfirmation,
} from '@solana/transaction-confirmation';
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
    sendTransaction_INTERNAL_ONLY_DO_NOT_EXPORT,
} from './send-transaction-internal';

interface SendAndConfirmDurableNonceTransactionFactoryConfig {
    rpc: Rpc<GetAccountInfoApi & GetSignatureStatusesApi & SendTransactionApi>;
    rpcSubscriptions: RpcSubscriptions<AccountNotificationsApi & SignatureNotificationsApi>;
}

interface SendAndConfirmTransactionWithBlockhashLifetimeFactoryConfig {
    rpc: Rpc<GetEpochInfoApi & GetSignatureStatusesApi & SendTransactionApi>;
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi & SlotNotificationsApi>;
}

interface SendTransactionWithoutConfirmingFactoryConfig {
    rpc: Rpc<SendTransactionApi>;
}

type SendAndConfirmTransactionWithBlockhashLifetimeFunction = (
    transaction: ITransactionWithBlockhashLifetime & SendableTransaction,
    config: Omit<
        Parameters<typeof sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT>[0],
        'confirmRecentTransaction' | 'rpc' | 'transaction'
    >,
) => Promise<void>;

type SendAndConfirmDurableNonceTransactionFunction = (
    transaction: BaseTransaction & IDurableNonceTransaction & IFullySignedTransaction & ITransactionWithFeePayer,
    config: Omit<
        Parameters<typeof sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT>[0],
        'confirmDurableNonceTransaction' | 'rpc' | 'transaction'
    >,
) => Promise<void>;

type SendTransactionWithoutConfirmingFunction = (
    transaction: SendableTransaction,
    config: Omit<Parameters<typeof sendTransaction_INTERNAL_ONLY_DO_NOT_EXPORT>[0], 'rpc' | 'transaction'>,
) => Promise<void>;

export function sendTransactionWithoutConfirmingFactory({
    rpc,
}: SendTransactionWithoutConfirmingFactoryConfig): SendTransactionWithoutConfirmingFunction {
    return async function sendTransactionWithoutConfirming(transaction, config) {
        await sendTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...config,
            rpc,
            transaction,
        });
    };
}

export function sendAndConfirmDurableNonceTransactionFactory({
    rpc,
    rpcSubscriptions,
}: SendAndConfirmDurableNonceTransactionFactoryConfig): SendAndConfirmDurableNonceTransactionFunction {
    const getNonceInvalidationPromise = createNonceInvalidationPromiseFactory(rpc, rpcSubscriptions);
    const getRecentSignatureConfirmationPromise = createRecentSignatureConfirmationPromiseFactory(
        rpc,
        rpcSubscriptions,
    );
    async function confirmDurableNonceTransaction(
        config: Omit<
            Parameters<typeof waitForDurableNonceTransactionConfirmation>[0],
            'getNonceInvalidationPromise' | 'getRecentSignatureConfirmationPromise'
        >,
    ) {
        await waitForDurableNonceTransactionConfirmation({
            ...config,
            getNonceInvalidationPromise,
            getRecentSignatureConfirmationPromise,
        });
    }
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
    const getBlockHeightExceedencePromise = createBlockHeightExceedencePromiseFactory({
        rpc,
        rpcSubscriptions,
    });
    const getRecentSignatureConfirmationPromise = createRecentSignatureConfirmationPromiseFactory(
        rpc,
        rpcSubscriptions,
    );
    async function confirmRecentTransaction(
        config: Omit<
            Parameters<typeof waitForRecentTransactionConfirmation>[0],
            'getBlockHeightExceedencePromise' | 'getRecentSignatureConfirmationPromise'
        >,
    ) {
        await waitForRecentTransactionConfirmation({
            ...config,
            getBlockHeightExceedencePromise,
            getRecentSignatureConfirmationPromise,
        });
    }
    return async function sendAndConfirmTransaction(transaction, config) {
        await sendAndConfirmTransactionWithBlockhashLifetime_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...config,
            confirmRecentTransaction,
            rpc,
            transaction,
        });
    };
}

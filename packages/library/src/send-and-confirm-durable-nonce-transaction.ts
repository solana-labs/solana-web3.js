import type { GetAccountInfoApi, GetSignatureStatusesApi, Rpc, SendTransactionApi } from '@solana/rpc';
import type { AccountNotificationsApi, RpcSubscriptions, SignatureNotificationsApi } from '@solana/rpc-subscriptions';
import {
    createNonceInvalidationPromiseFactory,
    createRecentSignatureConfirmationPromiseFactory,
    waitForDurableNonceTransactionConfirmation,
} from '@solana/transaction-confirmation';
import { FullySignedTransaction, TransactionWithDurableNonceLifetime } from '@solana/transactions';

import { sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT } from './send-transaction-internal';

type SendAndConfirmDurableNonceTransactionFunction = (
    transaction: FullySignedTransaction & TransactionWithDurableNonceLifetime,
    config: Omit<
        Parameters<typeof sendAndConfirmDurableNonceTransaction_INTERNAL_ONLY_DO_NOT_EXPORT>[0],
        'confirmDurableNonceTransaction' | 'rpc' | 'transaction'
    >,
) => Promise<void>;

type SendAndConfirmDurableNonceTransactionFactoryConfig<TCluster> = {
    rpc: Rpc<GetAccountInfoApi & GetSignatureStatusesApi & SendTransactionApi> & { '~cluster'?: TCluster };
    rpcSubscriptions: RpcSubscriptions<AccountNotificationsApi & SignatureNotificationsApi> & { '~cluster'?: TCluster };
};

export function sendAndConfirmDurableNonceTransactionFactory({
    rpc,
    rpcSubscriptions,
}: SendAndConfirmDurableNonceTransactionFactoryConfig<'devnet'>): SendAndConfirmDurableNonceTransactionFunction;
export function sendAndConfirmDurableNonceTransactionFactory({
    rpc,
    rpcSubscriptions,
}: SendAndConfirmDurableNonceTransactionFactoryConfig<'testnet'>): SendAndConfirmDurableNonceTransactionFunction;
export function sendAndConfirmDurableNonceTransactionFactory({
    rpc,
    rpcSubscriptions,
}: SendAndConfirmDurableNonceTransactionFactoryConfig<'mainnet'>): SendAndConfirmDurableNonceTransactionFunction;
export function sendAndConfirmDurableNonceTransactionFactory<
    TCluster extends 'devnet' | 'mainnet' | 'testnet' | void = void,
>({
    rpc,
    rpcSubscriptions,
}: SendAndConfirmDurableNonceTransactionFactoryConfig<TCluster>): SendAndConfirmDurableNonceTransactionFunction {
    const getNonceInvalidationPromise = createNonceInvalidationPromiseFactory({ rpc, rpcSubscriptions } as Parameters<
        typeof createNonceInvalidationPromiseFactory
    >[0]);
    const getRecentSignatureConfirmationPromise = createRecentSignatureConfirmationPromiseFactory({
        rpc,
        rpcSubscriptions,
    } as Parameters<typeof createRecentSignatureConfirmationPromiseFactory>[0]);
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

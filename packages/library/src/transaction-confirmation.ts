import type { Commitment } from '@solana/rpc-core';
import type { GetAccountInfoApi } from '@solana/rpc-core/dist/types/rpc-methods/getAccountInfo';
import type { GetSignatureStatusesApi } from '@solana/rpc-core/dist/types/rpc-methods/getSignatureStatuses';
import type { AccountNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/account-notifications';
import type { SignatureNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/signature-notifications';
import type { SlotNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/slot-notifications';
import type { Rpc, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import {
    getSignatureFromTransaction,
    IDurableNonceTransaction,
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
    ITransactionWithSignatures,
} from '@solana/transactions';

import { createBlockHeightExceedencePromiseFactory } from './transaction-confirmation-strategy-blockheight';
import { createNonceInvalidationPromiseFactory } from './transaction-confirmation-strategy-nonce';
import { createSignatureConfirmationPromiseFactory } from './transaction-confirmation-strategy-signature';

interface BaseConfig {
    abortSignal: AbortSignal;
    commitment: Commitment;
    getSignatureConfirmationPromise: ReturnType<typeof createSignatureConfirmationPromiseFactory>;
    transaction: ITransactionWithFeePayer & ITransactionWithSignatures;
}

interface DefaultDurableNonceTransactionConfirmerConfig {
    rpc: Rpc<GetSignatureStatusesApi & GetAccountInfoApi>;
    rpcSubscriptions: RpcSubscriptions<AccountNotificationsApi & SignatureNotificationsApi>;
}

interface DefaultTransactionConfirmerConfig {
    rpc: Rpc<GetSignatureStatusesApi>;
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi & SlotNotificationsApi>;
}

interface WaitForTransactionWithBlockhashLifetimeConfirmationConfig extends BaseConfig {
    getBlockHeightExceedencePromise: ReturnType<typeof createBlockHeightExceedencePromiseFactory>;
    transaction: ITransactionWithFeePayer & ITransactionWithSignatures & ITransactionWithBlockhashLifetime;
}

interface WaitForDurableNonceTransactionConfirmationConfig extends BaseConfig {
    getNonceInvalidationPromise: ReturnType<typeof createNonceInvalidationPromiseFactory>;
    transaction: ITransactionWithFeePayer & ITransactionWithSignatures & IDurableNonceTransaction;
}

async function raceStrategies<TConfig extends BaseConfig>(
    config: TConfig,
    getSpecificStrategiesForRace: (config: TConfig) => readonly Promise<unknown>[]
) {
    const { abortSignal: callerAbortSignal, commitment, getSignatureConfirmationPromise, transaction } = config;
    callerAbortSignal.throwIfAborted();
    const signature = getSignatureFromTransaction(transaction);
    const abortController = new AbortController();
    function handleAbort() {
        abortController.abort();
    }
    callerAbortSignal.addEventListener('abort', handleAbort, { signal: abortController.signal });
    try {
        const specificStrategies = getSpecificStrategiesForRace({
            ...config,
            abortSignal: abortController.signal,
        });
        return await Promise.race([
            getSignatureConfirmationPromise({
                abortSignal: abortController.signal,
                commitment,
                signature,
            }),
            ...specificStrategies,
        ]);
    } finally {
        abortController.abort();
    }
}

export function createDefaultDurableNonceTransactionConfirmer({
    rpc,
    rpcSubscriptions,
}: DefaultDurableNonceTransactionConfirmerConfig) {
    const getNonceInvalidationPromise = createNonceInvalidationPromiseFactory(rpc, rpcSubscriptions);
    const getSignatureConfirmationPromise = createSignatureConfirmationPromiseFactory(rpc, rpcSubscriptions);
    return async function confirmTransaction(
        config: Omit<
            Parameters<typeof waitForDurableNonceTransactionConfirmation>[0],
            'getNonceInvalidationPromise' | 'getSignatureConfirmationPromise'
        >
    ) {
        await waitForDurableNonceTransactionConfirmation({
            ...config,
            getNonceInvalidationPromise,
            getSignatureConfirmationPromise,
        });
    };
}

export function createDefaultTransactionConfirmer({ rpc, rpcSubscriptions }: DefaultTransactionConfirmerConfig) {
    const getBlockHeightExceedencePromise = createBlockHeightExceedencePromiseFactory(rpcSubscriptions);
    const getSignatureConfirmationPromise = createSignatureConfirmationPromiseFactory(rpc, rpcSubscriptions);
    return async function confirmTransaction(
        config: Omit<
            Parameters<typeof waitForTransactionConfirmation>[0],
            'getBlockHeightExceedencePromise' | 'getSignatureConfirmationPromise'
        >
    ) {
        await waitForTransactionConfirmation({
            ...config,
            getBlockHeightExceedencePromise,
            getSignatureConfirmationPromise,
        });
    };
}

export async function waitForDurableNonceTransactionConfirmation(
    config: WaitForDurableNonceTransactionConfirmationConfig
): Promise<void> {
    await raceStrategies(
        config,
        function getSpecificStrategiesForRace({ abortSignal, commitment, getNonceInvalidationPromise, transaction }) {
            return [
                getNonceInvalidationPromise({
                    abortSignal,
                    commitment,
                    currentNonceValue: transaction.lifetimeConstraint.nonce,
                    nonceAccountAddress: transaction.instructions[0].accounts[0].address,
                }),
            ];
        }
    );
}

export async function waitForTransactionConfirmation(
    config: WaitForTransactionWithBlockhashLifetimeConfirmationConfig
): Promise<void> {
    await raceStrategies(
        config,
        function getSpecificStrategiesForRace({ abortSignal, getBlockHeightExceedencePromise, transaction }) {
            return [
                getBlockHeightExceedencePromise({
                    abortSignal,
                    lastValidBlockHeight: transaction.lifetimeConstraint.lastValidBlockHeight,
                }),
            ];
        }
    );
}

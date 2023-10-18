import { Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';
import type { GetAccountInfoApi } from '@solana/rpc-core/dist/types/rpc-methods/getAccountInfo';
import type { GetSignatureStatusesApi } from '@solana/rpc-core/dist/types/rpc-methods/getSignatureStatuses';
import type { AccountNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/account-notifications';
import type { SignatureNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/signature-notifications';
import type { SlotNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/slot-notifications';
import type { Rpc, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import {
    getSignatureFromTransaction,
    IDurableNonceTransaction,
    ITransactionWithFeePayer,
    ITransactionWithSignatures,
} from '@solana/transactions';

import { createBlockHeightExceedencePromiseFactory } from './transaction-confirmation-strategy-blockheight';
import { createNonceInvalidationPromiseFactory } from './transaction-confirmation-strategy-nonce';
import { BaseTransactionConfirmationStrategyConfig, raceStrategies } from './transaction-confirmation-strategy-racer';
import { createRecentSignatureConfirmationPromiseFactory } from './transaction-confirmation-strategy-recent-signature';

interface DefaultDurableNonceTransactionConfirmerConfig {
    rpc: Rpc<GetSignatureStatusesApi & GetAccountInfoApi>;
    rpcSubscriptions: RpcSubscriptions<AccountNotificationsApi & SignatureNotificationsApi>;
}

interface DefaultRecentTransactionConfirmerConfig {
    rpc: Rpc<GetSignatureStatusesApi>;
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi & SlotNotificationsApi>;
}

interface WaitForDurableNonceTransactionConfirmationConfig extends BaseTransactionConfirmationStrategyConfig {
    getNonceInvalidationPromise: ReturnType<typeof createNonceInvalidationPromiseFactory>;
    transaction: ITransactionWithFeePayer & ITransactionWithSignatures & IDurableNonceTransaction;
}

interface WaitForRecentTransactionWithBlockhashLifetimeConfirmationConfig
    extends BaseTransactionConfirmationStrategyConfig {
    getBlockHeightExceedencePromise: ReturnType<typeof createBlockHeightExceedencePromiseFactory>;
    transaction: ITransactionWithFeePayer &
        ITransactionWithSignatures &
        Readonly<{
            lifetimeConstraint: {
                lastValidBlockHeight: Slot;
            };
        }>;
}

export function createDefaultDurableNonceTransactionConfirmer({
    rpc,
    rpcSubscriptions,
}: DefaultDurableNonceTransactionConfirmerConfig) {
    const getNonceInvalidationPromise = createNonceInvalidationPromiseFactory(rpc, rpcSubscriptions);
    const getRecentSignatureConfirmationPromise = createRecentSignatureConfirmationPromiseFactory(
        rpc,
        rpcSubscriptions
    );
    return async function confirmDurableNonceTransaction(
        config: Omit<
            Parameters<typeof waitForDurableNonceTransactionConfirmation>[0],
            'getNonceInvalidationPromise' | 'getRecentSignatureConfirmationPromise'
        >
    ) {
        await waitForDurableNonceTransactionConfirmation({
            ...config,
            getNonceInvalidationPromise,
            getRecentSignatureConfirmationPromise,
        });
    };
}

export function createDefaultRecentTransactionConfirmer({
    rpc,
    rpcSubscriptions,
}: DefaultRecentTransactionConfirmerConfig) {
    const getBlockHeightExceedencePromise = createBlockHeightExceedencePromiseFactory(rpcSubscriptions);
    const getRecentSignatureConfirmationPromise = createRecentSignatureConfirmationPromiseFactory(
        rpc,
        rpcSubscriptions
    );
    return async function confirmRecentTransaction(
        config: Omit<
            Parameters<typeof waitForRecentTransactionConfirmation>[0],
            'getBlockHeightExceedencePromise' | 'getRecentSignatureConfirmationPromise'
        >
    ) {
        await waitForRecentTransactionConfirmation({
            ...config,
            getBlockHeightExceedencePromise,
            getRecentSignatureConfirmationPromise,
        });
    };
}

export async function waitForDurableNonceTransactionConfirmation(
    config: WaitForDurableNonceTransactionConfirmationConfig
): Promise<void> {
    await raceStrategies(
        getSignatureFromTransaction(config.transaction),
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

export async function waitForRecentTransactionConfirmation(
    config: WaitForRecentTransactionWithBlockhashLifetimeConfirmationConfig
): Promise<void> {
    await raceStrategies(
        getSignatureFromTransaction(config.transaction),
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

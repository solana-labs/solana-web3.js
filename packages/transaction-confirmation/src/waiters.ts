import { Signature } from '@solana/keys';
import { newGetSignatureFromTransaction, NewTransaction } from '@solana/transactions';
import {
    TransactionBlockhashLifetime,
    TransactionDurableNonceLifetime,
} from '@solana/transactions/dist/types/lifetime';

import { createBlockHeightExceedencePromiseFactory } from './confirmation-strategy-blockheight';
import { createNonceInvalidationPromiseFactory } from './confirmation-strategy-nonce';
import { BaseTransactionConfirmationStrategyConfig, raceStrategies } from './confirmation-strategy-racer';
import { getTimeoutPromise } from './confirmation-strategy-timeout';

interface WaitForDurableNonceTransactionConfirmationConfig extends BaseTransactionConfirmationStrategyConfig {
    getNonceInvalidationPromise: ReturnType<typeof createNonceInvalidationPromiseFactory>;
    transaction: NewTransaction & { lifetimeConstraint: TransactionDurableNonceLifetime };
}

interface WaitForRecentTransactionWithBlockhashLifetimeConfirmationConfig
    extends BaseTransactionConfirmationStrategyConfig {
    getBlockHeightExceedencePromise: ReturnType<typeof createBlockHeightExceedencePromiseFactory>;
    transaction: NewTransaction & { lifetimeConstraint: TransactionBlockhashLifetime };
}

interface WaitForRecentTransactionWithTimeBasedLifetimeConfirmationConfig
    extends BaseTransactionConfirmationStrategyConfig {
    getTimeoutPromise: typeof getTimeoutPromise;
    signature: Signature;
}

export async function waitForDurableNonceTransactionConfirmation(
    config: WaitForDurableNonceTransactionConfirmationConfig,
): Promise<void> {
    await raceStrategies(
        newGetSignatureFromTransaction(config.transaction),
        config,
        function getSpecificStrategiesForRace({ abortSignal, commitment, getNonceInvalidationPromise, transaction }) {
            return [
                getNonceInvalidationPromise({
                    abortSignal,
                    commitment,
                    currentNonceValue: transaction.lifetimeConstraint.nonce,
                    nonceAccountAddress: transaction.lifetimeConstraint.nonceAccountAddress,
                }),
            ];
        },
    );
}

export async function waitForRecentTransactionConfirmation(
    config: WaitForRecentTransactionWithBlockhashLifetimeConfirmationConfig,
): Promise<void> {
    await raceStrategies(
        newGetSignatureFromTransaction(config.transaction),
        config,
        function getSpecificStrategiesForRace({
            abortSignal,
            commitment,
            getBlockHeightExceedencePromise,
            transaction,
        }) {
            return [
                getBlockHeightExceedencePromise({
                    abortSignal,
                    commitment,
                    lastValidBlockHeight: transaction.lifetimeConstraint.lastValidBlockHeight,
                }),
            ];
        },
    );
}

/** @deprecated */
export async function waitForRecentTransactionConfirmationUntilTimeout(
    config: WaitForRecentTransactionWithTimeBasedLifetimeConfirmationConfig,
): Promise<void> {
    await raceStrategies(
        config.signature,
        config,
        function getSpecificStrategiesForRace({ abortSignal, commitment, getTimeoutPromise }) {
            return [
                getTimeoutPromise({
                    abortSignal,
                    commitment,
                }),
            ];
        },
    );
}

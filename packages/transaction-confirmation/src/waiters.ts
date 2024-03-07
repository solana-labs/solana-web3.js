import { Signature } from '@solana/keys';
import type { Slot } from '@solana/rpc-types';
import {
    getSignatureFromTransaction,
    IDurableNonceTransaction,
    ITransactionWithFeePayer,
    ITransactionWithSignatures,
} from '@solana/transactions';

import { createBlockHeightExceedencePromiseFactory } from './confirmation-strategy-blockheight';
import { createNonceInvalidationPromiseFactory } from './confirmation-strategy-nonce';
import { BaseTransactionConfirmationStrategyConfig, raceStrategies } from './confirmation-strategy-racer';
import { getTimeoutPromise } from './confirmation-strategy-timeout';

interface WaitForDurableNonceTransactionConfirmationConfig extends BaseTransactionConfirmationStrategyConfig {
    getNonceInvalidationPromise: ReturnType<typeof createNonceInvalidationPromiseFactory>;
    transaction: IDurableNonceTransaction & ITransactionWithFeePayer & ITransactionWithSignatures;
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

interface WaitForRecentTransactionWithTimeBasedLifetimeConfirmationConfig
    extends BaseTransactionConfirmationStrategyConfig {
    getTimeoutPromise: typeof getTimeoutPromise;
    signature: Signature;
}

export async function waitForDurableNonceTransactionConfirmation(
    config: WaitForDurableNonceTransactionConfirmationConfig,
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
        },
    );
}

export async function waitForRecentTransactionConfirmation(
    config: WaitForRecentTransactionWithBlockhashLifetimeConfirmationConfig,
): Promise<void> {
    await raceStrategies(
        getSignatureFromTransaction(config.transaction),
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

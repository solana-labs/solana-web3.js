import type { Commitment } from '@solana/rpc-core';
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

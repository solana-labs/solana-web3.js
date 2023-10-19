import { Commitment } from '@solana/rpc-core';
import { TransactionSignature } from '@solana/transactions';

import { createRecentSignatureConfirmationPromiseFactory } from './transaction-confirmation-strategy-recent-signature';

export interface BaseTransactionConfirmationStrategyConfig {
    abortSignal: AbortSignal;
    commitment: Commitment;
    getRecentSignatureConfirmationPromise: ReturnType<typeof createRecentSignatureConfirmationPromiseFactory>;
}

export async function raceStrategies<TConfig extends BaseTransactionConfirmationStrategyConfig>(
    signature: TransactionSignature,
    config: TConfig,
    getSpecificStrategiesForRace: (config: TConfig) => readonly Promise<unknown>[]
) {
    const { abortSignal: callerAbortSignal, commitment, getRecentSignatureConfirmationPromise } = config;
    callerAbortSignal.throwIfAborted();
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
            getRecentSignatureConfirmationPromise({
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

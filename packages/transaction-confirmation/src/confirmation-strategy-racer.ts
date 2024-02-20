import type { Signature } from '@solana/keys';
import type { Commitment } from '@solana/rpc-types';

import { createRecentSignatureConfirmationPromiseFactory } from './confirmation-strategy-recent-signature';

export interface BaseTransactionConfirmationStrategyConfig {
    abortSignal?: AbortSignal;
    commitment: Commitment;
    getRecentSignatureConfirmationPromise: ReturnType<typeof createRecentSignatureConfirmationPromiseFactory>;
}

type WithNonNullableAbortSignal<T> = Omit<T, 'abortSignal'> & Readonly<{ abortSignal: AbortSignal }>;

export async function raceStrategies<TConfig extends BaseTransactionConfirmationStrategyConfig>(
    signature: Signature,
    config: TConfig,
    getSpecificStrategiesForRace: (config: WithNonNullableAbortSignal<TConfig>) => readonly Promise<unknown>[],
) {
    const { abortSignal: callerAbortSignal, commitment, getRecentSignatureConfirmationPromise } = config;
    callerAbortSignal?.throwIfAborted();
    const abortController = new AbortController();
    if (callerAbortSignal) {
        const handleAbort = () => {
            abortController.abort();
        };
        callerAbortSignal.addEventListener('abort', handleAbort, { signal: abortController.signal });
    }
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

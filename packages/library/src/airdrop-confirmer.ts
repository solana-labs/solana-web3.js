import { Signature } from '@solana/keys';
import { GetSignatureStatusesApi } from '@solana/rpc-core/dist/types/rpc-methods/getSignatureStatuses';
import { SignatureNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/signature-notifications';
import { Rpc, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { BaseTransactionConfirmationStrategyConfig, raceStrategies } from './transaction-confirmation-strategy-racer';
import { createRecentSignatureConfirmationPromiseFactory } from './transaction-confirmation-strategy-recent-signature';
import { getTimeoutPromise } from './transaction-confirmation-strategy-timeout';

interface DefaultSignatureOnlyRecentTransactionConfirmerConfig {
    rpc: Rpc<GetSignatureStatusesApi>;
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi>;
}

interface WaitForRecentTransactionWithTimeBasedLifetimeConfirmationConfig
    extends BaseTransactionConfirmationStrategyConfig {
    getTimeoutPromise: typeof getTimeoutPromise;
    signature: Signature;
}

/** @deprecated */
export function createDefaultSignatureOnlyRecentTransactionConfirmer({
    rpc,
    rpcSubscriptions,
}: DefaultSignatureOnlyRecentTransactionConfirmerConfig) {
    const getRecentSignatureConfirmationPromise = createRecentSignatureConfirmationPromiseFactory(
        rpc,
        rpcSubscriptions
    );
    return async function confirmSignatureOnlyRecentTransaction(
        config: Omit<
            Parameters<typeof waitForRecentTransactionConfirmationUntilTimeout>[0],
            'getRecentSignatureConfirmationPromise' | 'getTimeoutPromise'
        >
    ) {
        await waitForRecentTransactionConfirmationUntilTimeout({
            ...config,
            getRecentSignatureConfirmationPromise,
            getTimeoutPromise,
        });
    };
}

/** @deprecated */
export async function waitForRecentTransactionConfirmationUntilTimeout(
    config: WaitForRecentTransactionWithTimeBasedLifetimeConfirmationConfig
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
        }
    );
}

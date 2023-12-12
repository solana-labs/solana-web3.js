import { createJsonRpcSubscriptionsApi, IRpcSubscriptionsApi } from '@solana/rpc-transport';

import { patchParamsForSolanaLabsRpc } from '../params-patcher';
import { patchResponseForSolanaLabsRpcSubscriptions } from '../response-patcher';
import { AccountNotificationsApi } from './account-notifications';
import { BlockNotificationsApi } from './block-notifications';
import { LogsNotificationsApi } from './logs-notifications';
import { ProgramNotificationsApi } from './program-notifications';
import { RootNotificationsApi } from './root-notifications';
import { SignatureNotificationsApi } from './signature-notifications';
import { SlotNotificationsApi } from './slot-notifications';
import { SlotsUpdatesNotificationsApi } from './slots-updates-notifications';
import { VoteNotificationsApi } from './vote-notifications';

type Config = Readonly<{
    onIntegerOverflow?: (methodName: string, keyPath: (number | string)[], value: bigint) => void;
}>;

export type SolanaRpcSubscriptions = AccountNotificationsApi &
    BlockNotificationsApi &
    LogsNotificationsApi &
    ProgramNotificationsApi &
    RootNotificationsApi &
    SignatureNotificationsApi &
    SlotNotificationsApi;
export type SolanaRpcSubscriptionsUnstable = SlotsUpdatesNotificationsApi & VoteNotificationsApi;

export function createSolanaRpcSubscriptionsApi_INTERNAL(
    config?: Config,
): IRpcSubscriptionsApi<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable> {
    const handleIntegerOverflow = config?.onIntegerOverflow;
    return createJsonRpcSubscriptionsApi<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable>({
        parametersTransformer: <T>(rawParams: T, methodName: string) =>
            patchParamsForSolanaLabsRpc(
                rawParams,
                handleIntegerOverflow
                    ? (keyPath, value) => handleIntegerOverflow(methodName, keyPath, value)
                    : undefined,
            ) as unknown[],
        responseTransformer: <T>(rawResponse: unknown, methodName: string): T =>
            patchResponseForSolanaLabsRpcSubscriptions(
                rawResponse,
                methodName as keyof (SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable),
            ),
        subscribeNotificationNameTransformer: (notificationName: string) =>
            notificationName.replace(/Notifications$/, 'Subscribe'),
        unsubscribeNotificationNameTransformer: (notificationName: string) =>
            notificationName.replace(/Notifications$/, 'Unsubscribe'),
    });
}

export function createSolanaRpcSubscriptionsApi(config?: Config): IRpcSubscriptionsApi<SolanaRpcSubscriptions> {
    return createSolanaRpcSubscriptionsApi_INTERNAL(config) as IRpcSubscriptionsApi<SolanaRpcSubscriptions>;
}

export function createSolanaRpcSubscriptionsApi_UNSTABLE(
    config?: Config,
): IRpcSubscriptionsApi<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable> {
    return createSolanaRpcSubscriptionsApi_INTERNAL(config) as IRpcSubscriptionsApi<
        SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
    >;
}

export type { AccountNotificationsApi, SignatureNotificationsApi, SlotNotificationsApi };

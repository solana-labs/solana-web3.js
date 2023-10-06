import { IRpcSubscriptionsApi, RpcSubscription } from '@solana/rpc-transport/dist/types/json-rpc-types';

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

export function createSolanaRpcSubscriptionsApi(
    config?: Config
): IRpcSubscriptionsApi<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable> {
    return new Proxy({} as IRpcSubscriptionsApi<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable>, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get<
            TNotificationName extends keyof IRpcSubscriptionsApi<
                SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
            >
        >(
            ...args: Parameters<
                NonNullable<
                    ProxyHandler<IRpcSubscriptionsApi<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable>>['get']
                >
            >
        ) {
            const [_, p] = args;
            const notificationName = p.toString() as keyof (SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable);
            return function (
                ...rawParams: Parameters<
                    (SolanaRpcSubscriptions &
                        SolanaRpcSubscriptionsUnstable)[TNotificationName] extends CallableFunction
                        ? (SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable)[TNotificationName]
                        : never
                >
            ): RpcSubscription<
                ReturnType<(SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable)[TNotificationName]>
            > {
                const handleIntegerOverflow = config?.onIntegerOverflow;
                const params = patchParamsForSolanaLabsRpc(
                    rawParams,
                    handleIntegerOverflow
                        ? (keyPath, value) => handleIntegerOverflow(notificationName, keyPath, value)
                        : undefined
                );
                return {
                    params,
                    responseProcessor: rawResponse =>
                        patchResponseForSolanaLabsRpcSubscriptions(rawResponse, notificationName),
                    subscribeMethodName: notificationName.replace(/Notifications$/, 'Subscribe'),
                    unsubscribeMethodName: notificationName.replace(/Notifications$/, 'Unsubscribe'),
                };
            };
        },
    });
}

export function createSolanaRpcSubscriptionsApi_UNSTABLE(
    config?: Config
): IRpcSubscriptionsApi<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable> {
    return createSolanaRpcSubscriptionsApi(config) as IRpcSubscriptionsApi<
        SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
    >;
}

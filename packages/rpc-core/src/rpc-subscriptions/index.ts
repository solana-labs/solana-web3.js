import { IRpcSubscriptionsApi, RpcSubscription } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { patchParamsForSolanaLabsRpc } from '../params-patcher';
import { patchResponseForSolanaLabsRpcSubscriptions } from '../response-patcher';
import { SlotNotificationsApi } from './slot-notifications';

type Config = Readonly<{
    onIntegerOverflow?: (methodName: string, keyPath: (number | string)[], value: bigint) => void;
}>;

export type SolanaRpcSubscriptions = SlotNotificationsApi;

export function createSolanaRpcSubscriptionsApi(config?: Config): IRpcSubscriptionsApi<SolanaRpcSubscriptions> {
    return new Proxy({} as IRpcSubscriptionsApi<SolanaRpcSubscriptions>, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get<TNotificationName extends keyof IRpcSubscriptionsApi<SolanaRpcSubscriptions>>(
            ...args: Parameters<NonNullable<ProxyHandler<IRpcSubscriptionsApi<SolanaRpcSubscriptions>>['get']>>
        ) {
            const [_, p] = args;
            const notificationName = p.toString() as keyof SolanaRpcSubscriptions;
            return function (
                ...rawParams: Parameters<
                    SolanaRpcSubscriptions[TNotificationName] extends CallableFunction
                        ? SolanaRpcSubscriptions[TNotificationName]
                        : never
                >
            ): RpcSubscription<ReturnType<SolanaRpcSubscriptions[TNotificationName]>> {
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

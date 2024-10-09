import { Callable } from '@solana/rpc-spec-types';
import { DataPublisher } from '@solana/subscribable';

import { RpcSubscriptionsChannel } from './rpc-subscriptions-channel';
import { RpcSubscriptionsTransportDataEvents } from './rpc-subscriptions-transport';

export type RpcSubscriptionsApiConfig<TApiMethods extends RpcSubscriptionsApiMethods> = Readonly<{
    getSubscriptionConfigurationHash?: (
        details: Readonly<{
            notificationName: string;
            params: unknown;
        }>,
    ) => string | undefined;
    planExecutor: RpcSubscriptionsPlanExecutor<ReturnType<TApiMethods[keyof TApiMethods]>>;
}>;

type RpcSubscriptionsPlanExecutor<TNotification> = (
    config: Readonly<{
        channel: RpcSubscriptionsChannel<unknown, unknown>;
        notificationName: string;
        params?: unknown[];
        signal: AbortSignal;
    }>,
) => Promise<DataPublisher<RpcSubscriptionsTransportDataEvents<TNotification>>>;

export type RpcSubscriptionsPlan<TNotification> = Readonly<{
    /**
     * This method may be called with a newly-opened channel or a pre-established channel.
     */
    executeSubscriptionPlan: (
        config: Readonly<{
            channel: RpcSubscriptionsChannel<unknown, unknown>;
            signal: AbortSignal;
        }>,
    ) => Promise<DataPublisher<RpcSubscriptionsTransportDataEvents<TNotification>>>;
    /**
     * This hash uniquely identifies the configuration of a subscription. It is typically used by
     * consumers of this API to deduplicate multiple subscriptions for the same notification.
     */
    subscriptionConfigurationHash: string | undefined;
}>;

export type RpcSubscriptionsApi<TRpcSubscriptionMethods> = {
    [MethodName in keyof TRpcSubscriptionMethods]: RpcSubscriptionsReturnTypeMapper<
        TRpcSubscriptionMethods[MethodName]
    >;
};

type RpcSubscriptionsReturnTypeMapper<TRpcMethod> = TRpcMethod extends Callable
    ? (...rawParams: unknown[]) => RpcSubscriptionsPlan<ReturnType<TRpcMethod>>
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcSubscriptionsApiMethod = (...args: any) => any;
export interface RpcSubscriptionsApiMethods {
    [methodName: string]: RpcSubscriptionsApiMethod;
}

const UNINITIALIZED = Symbol();

export function createRpcSubscriptionsApi<TRpcSubscriptionsApiMethods extends RpcSubscriptionsApiMethods>(
    config: RpcSubscriptionsApiConfig<TRpcSubscriptionsApiMethods>,
): RpcSubscriptionsApi<TRpcSubscriptionsApiMethods> {
    return new Proxy({} as RpcSubscriptionsApi<TRpcSubscriptionsApiMethods>, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get<TNotificationName extends keyof RpcSubscriptionsApi<TRpcSubscriptionsApiMethods>>(
            ...args: Parameters<NonNullable<ProxyHandler<RpcSubscriptionsApi<TRpcSubscriptionsApiMethods>>['get']>>
        ) {
            const [_, p] = args;
            const notificationName = p.toString() as keyof TRpcSubscriptionsApiMethods as string;
            return function (
                ...params: Parameters<
                    TRpcSubscriptionsApiMethods[TNotificationName] extends CallableFunction
                        ? TRpcSubscriptionsApiMethods[TNotificationName]
                        : never
                >
            ): RpcSubscriptionsPlan<ReturnType<TRpcSubscriptionsApiMethods[TNotificationName]>> {
                let _cachedSubscriptionHash: string | typeof UNINITIALIZED | undefined = UNINITIALIZED;
                return {
                    executeSubscriptionPlan(planConfig) {
                        return config.planExecutor({
                            ...planConfig,
                            notificationName,
                            params,
                        });
                    },
                    get subscriptionConfigurationHash() {
                        if (_cachedSubscriptionHash === UNINITIALIZED) {
                            _cachedSubscriptionHash = config?.getSubscriptionConfigurationHash?.({
                                notificationName,
                                params,
                            });
                        }
                        return _cachedSubscriptionHash;
                    },
                };
            };
        },
    });
}

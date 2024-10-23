import { Callable, RpcRequest, RpcRequestTransformer } from '@solana/rpc-spec-types';
import { DataPublisher } from '@solana/subscribable';

import { RpcSubscriptionsChannel } from './rpc-subscriptions-channel';
import { RpcSubscriptionsTransportDataEvents } from './rpc-subscriptions-transport';

export type RpcSubscriptionsApiConfig<TApiMethods extends RpcSubscriptionsApiMethods> = Readonly<{
    planExecutor: RpcSubscriptionsPlanExecutor<ReturnType<TApiMethods[keyof TApiMethods]>>;
    requestTransformer?: RpcRequestTransformer;
}>;

type RpcSubscriptionsPlanExecutor<TNotification> = (
    config: Readonly<{
        channel: RpcSubscriptionsChannel<unknown, unknown>;
        request: RpcRequest;
        signal: AbortSignal;
    }>,
) => Promise<DataPublisher<RpcSubscriptionsTransportDataEvents<TNotification>>>;

export type RpcSubscriptionsPlan<TNotification> = Readonly<{
    /**
     * This method may be called with a newly-opened channel or a pre-established channel.
     */
    execute: (
        config: Readonly<{
            channel: RpcSubscriptionsChannel<unknown, unknown>;
            signal: AbortSignal;
        }>,
    ) => Promise<DataPublisher<RpcSubscriptionsTransportDataEvents<TNotification>>>;
    /**
     * This request is used to uniquely identify the subscription.
     * It typically comes from the method name and parameters of the subscription call,
     * after potentially being transformed by the RPC Subscriptions API.
     */
    request: RpcRequest;
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
            const methodName = p.toString() as keyof TRpcSubscriptionsApiMethods as string;
            return function (
                ...params: Parameters<
                    TRpcSubscriptionsApiMethods[TNotificationName] extends CallableFunction
                        ? TRpcSubscriptionsApiMethods[TNotificationName]
                        : never
                >
            ): RpcSubscriptionsPlan<ReturnType<TRpcSubscriptionsApiMethods[TNotificationName]>> {
                const rawRequest = { methodName, params };
                const request = config.requestTransformer ? config.requestTransformer(rawRequest) : rawRequest;
                return {
                    execute(planConfig) {
                        return config.planExecutor({ ...planConfig, request });
                    },
                    request,
                };
            };
        },
    });
}

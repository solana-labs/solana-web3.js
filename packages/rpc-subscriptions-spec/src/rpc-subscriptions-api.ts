import { Callable } from '@solana/rpc-spec-types';

import { RpcSubscriptionsRequest } from './rpc-subscriptions-request';

export type RpcSubscriptionsApiConfig = Readonly<{
    parametersTransformer?: <T extends unknown[]>(params: T, notificationName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, notificationName: string) => T;
    subscribeNotificationNameTransformer?: (notificationName: string) => string;
    unsubscribeNotificationNameTransformer?: (notificationName: string) => string;
}>;

export type RpcSubscriptionsApi<TRpcSubscriptionMethods> = {
    [MethodName in keyof TRpcSubscriptionMethods]: RpcSubscriptionsReturnTypeMapper<
        TRpcSubscriptionMethods[MethodName]
    >;
};

type RpcSubscriptionsReturnTypeMapper<TRpcMethod> = TRpcMethod extends Callable
    ? (...rawParams: unknown[]) => RpcSubscriptionsRequest<ReturnType<TRpcMethod>>
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcSubscriptionsApiMethod = (...args: any) => any;
export interface RpcSubscriptionsApiMethods {
    [methodName: string]: RpcSubscriptionsApiMethod;
}

export function createRpcSubscriptionsApi<TRpcSubscriptionsApiMethods extends RpcSubscriptionsApiMethods>(
    config?: RpcSubscriptionsApiConfig,
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
                ...rawParams: Parameters<
                    TRpcSubscriptionsApiMethods[TNotificationName] extends CallableFunction
                        ? TRpcSubscriptionsApiMethods[TNotificationName]
                        : never
                >
            ): RpcSubscriptionsRequest<ReturnType<TRpcSubscriptionsApiMethods[TNotificationName]>> {
                const params = config?.parametersTransformer
                    ? config?.parametersTransformer(rawParams, notificationName)
                    : rawParams;
                const responseTransformer = config?.responseTransformer
                    ? config?.responseTransformer<ReturnType<TRpcSubscriptionsApiMethods[TNotificationName]>>
                    : (rawResponse: unknown) =>
                          rawResponse as ReturnType<TRpcSubscriptionsApiMethods[TNotificationName]>;
                const subscribeMethodName = config?.subscribeNotificationNameTransformer
                    ? config?.subscribeNotificationNameTransformer(notificationName)
                    : notificationName;
                const unsubscribeMethodName = config?.unsubscribeNotificationNameTransformer
                    ? config?.unsubscribeNotificationNameTransformer(notificationName)
                    : notificationName;
                return {
                    params,
                    responseTransformer,
                    subscribeMethodName,
                    unsubscribeMethodName,
                };
            };
        },
    });
}

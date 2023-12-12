import { IRpcSubscriptionsApi, RpcSubscription } from '../../json-rpc-types';
import { IRpcApiSubscriptions, RpcSubscriptionsApiConfig } from '../api-types';

export function createJsonRpcSubscriptionsApi<TRpcSubscriptions extends IRpcApiSubscriptions>(
    config?: RpcSubscriptionsApiConfig,
): IRpcSubscriptionsApi<TRpcSubscriptions> {
    return new Proxy({} as IRpcSubscriptionsApi<TRpcSubscriptions>, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get<TNotificationName extends keyof IRpcSubscriptionsApi<TRpcSubscriptions>>(
            ...args: Parameters<NonNullable<ProxyHandler<IRpcSubscriptionsApi<TRpcSubscriptions>>['get']>>
        ) {
            const [_, p] = args;
            const notificationName = p.toString() as keyof TRpcSubscriptions as string;
            return function (
                ...rawParams: Parameters<
                    TRpcSubscriptions[TNotificationName] extends CallableFunction
                        ? TRpcSubscriptions[TNotificationName]
                        : never
                >
            ): RpcSubscription<ReturnType<TRpcSubscriptions[TNotificationName]>> {
                const params = config?.parametersTransformer
                    ? config?.parametersTransformer(rawParams, notificationName)
                    : rawParams;
                const responseTransformer = config?.responseTransformer
                    ? config?.responseTransformer<ReturnType<TRpcSubscriptions[TNotificationName]>>
                    : (rawResponse: unknown) => rawResponse as ReturnType<TRpcSubscriptions[TNotificationName]>;
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

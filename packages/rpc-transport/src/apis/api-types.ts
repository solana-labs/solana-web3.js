// RPC Methods
export type RpcApiConfig = Readonly<{
    parametersTransformer?: <T extends unknown[]>(params: T, methodName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, methodName: string) => T;
}>;

// RPC Subscription Methods
export type RpcSubscriptionsApiConfig = Readonly<{
    parametersTransformer?: <T extends unknown[]>(params: T, notificationName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, notificationName: string) => T;
    subscribeNotificationNameTransformer?: (notificationName: string) => string;
    unsubscribeNotificationNameTransformer?: (notificationName: string) => string;
}>;

// RPC Methods
export type RpcApiConfig = Readonly<{
    parametersTransformer?: <T>(params: T, methodName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, methodName: string) => T;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcMethod = (...args: any) => any;

export interface IRpcApiMethods {
    [methodName: string]: RpcMethod;
}

// RPC Subscription Methods
export type RpcSubscriptionsApiConfig = Readonly<{
    parametersTransformer?: <T>(params: T, notificationName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, notificationName: string) => T;
    subscribeNotificationNameTransformer?: (notificationName: string) => string;
    unsubscribeNotificationNameTransformer?: (notificationName: string) => string;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcSubscription = (...args: any) => any;

export interface IRpcApiSubscriptions {
    [notificationName: string]: RpcSubscription;
}

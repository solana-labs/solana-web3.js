// RPC Methods
export type RpcApiConfig = Readonly<{
    parametersTransformer?: <T extends unknown[]>(params: T, methodName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, methodName: string) => T;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcMethod = (...args: any) => any;

export interface IRpcApiMethods {
    [methodName: string]: RpcMethod;
}

export type IRpcApiMethodsDevnet<TRpcMethods> = TRpcMethods & { readonly '~cluster': 'devnet' };
export type IRpcApiMethodsTestnet<TRpcMethods> = TRpcMethods & { readonly '~cluster': 'testnet' };
export type IRpcApiMethodsMainnet<TRpcMethods> = TRpcMethods & { readonly '~cluster': 'mainnet' };

// RPC Subscription Methods
export type RpcSubscriptionsApiConfig = Readonly<{
    parametersTransformer?: <T extends unknown[]>(params: T, notificationName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, notificationName: string) => T;
    subscribeNotificationNameTransformer?: (notificationName: string) => string;
    unsubscribeNotificationNameTransformer?: (notificationName: string) => string;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcSubscription = (...args: any) => any;

export interface IRpcApiSubscriptions {
    [notificationName: string]: RpcSubscription;
}

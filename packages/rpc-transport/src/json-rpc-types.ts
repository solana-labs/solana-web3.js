import { IRpcTransport, IRpcWebSocketTransport } from './transports/transport-types';

/**
 * Public RPC API.
 */
export type IRpcApi<TRpcMethods> = {
    [MethodName in keyof TRpcMethods]: TRpcMethods[MethodName] extends Callable
        ? (...rawParams: unknown[]) => RpcRequest<ReturnType<TRpcMethods[MethodName]>>
        : never;
};
export type IRpcSubscriptionsApi<TRpcMethods> = {
    [MethodName in keyof TRpcMethods]: TRpcMethods[MethodName] extends Callable
        ? (...rawParams: unknown[]) => RpcSubscription<ReturnType<TRpcMethods[MethodName]>>
        : never;
};
export type Rpc<TRpcMethods> = RpcMethods<TRpcMethods>;
export type RpcSubscriptions<TRpcSubscriptionMethods> = RpcSubscriptionMethods<TRpcSubscriptionMethods>;
export type RpcConfig<TRpcMethods> = Readonly<{
    api: IRpcApi<TRpcMethods>;
    transport: IRpcTransport;
}>;
export type RpcSubscriptionConfig<TRpcMethods> = Readonly<{
    api: IRpcSubscriptionsApi<TRpcMethods>;
    transport: IRpcWebSocketTransport;
}>;

/**
 * Public pending RPC request API.
 */
export type RpcRequest<TResponse> = {
    methodName: string;
    params: unknown[];
    responseProcessor?: (response: unknown) => TResponse;
};
export type RpcSubscription<TResponse> = {
    params: unknown[];
    responseProcessor?: (response: unknown) => TResponse;
    subscribeMethodName: string;
    unsubscribeMethodName: string;
};
export type PendingRpcRequest<TResponse> = {
    send(options?: SendOptions): Promise<TResponse>;
};
export type PendingRpcSubscription<TNotification> = {
    subscribe(options: SubscribeOptions): Promise<AsyncIterable<TNotification>>;
};
export type SendOptions = Readonly<{
    abortSignal?: AbortSignal;
}>;
export type SubscribeOptions = Readonly<{
    abortSignal: AbortSignal;
}>;

/**
 * Private RPC-building types.
 */
type RpcMethods<TRpcMethods> = {
    [TMethodName in keyof TRpcMethods]: RpcMethodImplementations<TRpcMethods, TMethodName>;
};
type RpcSubscriptionMethods<TRpcSubscriptionMethods> = {
    [TMethodName in keyof TRpcSubscriptionMethods]: RpcSubscriptionMethodImplementations<
        TRpcSubscriptionMethods,
        TMethodName
    >;
};
type RpcMethodImplementations<TRpcMethods, TMethod extends keyof TRpcMethods> = UnionToIntersection<
    RpcOverloads<TRpcMethods[TMethod]>
>;
type RpcSubscriptionMethodImplementations<
    TRpcSubscriptionMethods,
    TMethod extends keyof TRpcSubscriptionMethods
> = UnionToIntersection<RpcSubscriptionOverloads<TRpcSubscriptionMethods[TMethod]>>;

/**
 * Utility types that do terrible, awful things.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callable = (...args: any[]) => any;
type OverloadProps<TOverload> = Pick<TOverload, keyof TOverload>;
type RpcOverloadUnionRecursive<TOverload, TPartialOverload = unknown> = TOverload extends (
    ...args: infer TArgs
) => infer TReturn
    ? // Prevent infinite recursion by stopping recursion when TPartialOverload
      // has accumulated all of the TOverload signatures.
      TPartialOverload extends TOverload
        ? never
        :
              | RpcOverloadUnionRecursive<
                    TPartialOverload & TOverload,
                    TPartialOverload & ((...args: TArgs) => TReturn) & OverloadProps<TOverload>
                >
              | ((...args: TArgs) => PendingRpcRequest<TReturn>)
    : never;
type RpcOverloads<TOverload> = Exclude<
    RpcOverloadUnionRecursive<
        // The "() => never" signature must be hoisted to the "front" of the
        // intersection, for two reasons: a) because recursion stops when it is
        // encountered, and b) it seems to prevent the collapse of subsequent
        // "compatible" signatures (eg. "() => void" into "(a?: 1) => void"),
        // which gives a direct conversion to a union.
        (() => never) & TOverload
    >,
    TOverload extends () => never ? never : () => PendingRpcRequest<never>
>;
type RpcSubscriptionOverloadUnionRecursive<TOverload, TPartialOverload = unknown> = TOverload extends (
    ...args: infer TArgs
) => infer TReturn
    ? // Prevent infinite recursion by stopping recursion when TPartialOverload
      // has accumulated all of the TOverload signatures.
      TPartialOverload extends TOverload
        ? never
        :
              | RpcSubscriptionOverloadUnionRecursive<
                    TPartialOverload & TOverload,
                    TPartialOverload & ((...args: TArgs) => TReturn) & OverloadProps<TOverload>
                >
              | ((...args: TArgs) => PendingRpcSubscription<TReturn>)
    : never;
type RpcSubscriptionOverloads<TOverload> = Exclude<
    RpcSubscriptionOverloadUnionRecursive<
        // The "() => never" signature must be hoisted to the "front" of the
        // intersection, for two reasons: a) because recursion stops when it is
        // encountered, and b) it seems to prevent the collapse of subsequent
        // "compatible" signatures (eg. "() => void" into "(a?: 1) => void"),
        // which gives a direct conversion to a union.
        (() => never) & TOverload
    >,
    TOverload extends () => never ? never : () => PendingRpcSubscription<never>
>;
type UnionToIntersection<T> = (T extends unknown ? (x: T) => unknown : never) extends (x: infer R) => unknown
    ? R
    : never;

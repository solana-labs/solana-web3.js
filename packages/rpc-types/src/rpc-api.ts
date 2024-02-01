import { ClusterUrl, DevnetUrl, MainnetUrl, TestnetUrl } from './cluster-url';
import type { Overloads } from './overloads';
import type { Slot } from './typed-numbers';

type RpcTransportConfig = Readonly<{
    payload: unknown;
    signal?: AbortSignal;
}>;

export type RpcWebSocketConnection = Readonly<{
    send(payload: unknown): Promise<void>;
    [Symbol.asyncIterator](): AsyncGenerator<unknown>;
}>;

type RpcWebSocketTransportConfig = Readonly<{
    payload: unknown;
    signal: AbortSignal;
}>;

/**
 * Public RPC Transport API
 */
export interface IRpcTransport {
    <TResponse>(config: RpcTransportConfig): Promise<TResponse>;
}
export type IRpcTransportDevnet = IRpcTransport & { '~cluster': 'devnet' };
export type IRpcTransportTestnet = IRpcTransport & { '~cluster': 'testnet' };
export type IRpcTransportMainnet = IRpcTransport & { '~cluster': 'mainnet' };
export type IIRpcTransport = IRpcTransport | IRpcTransportDevnet | IRpcTransportTestnet | IRpcTransportMainnet;
export type IRpcTransportFromClusterUrl<TClusterUrl extends ClusterUrl> = TClusterUrl extends DevnetUrl
    ? IRpcTransportDevnet
    : TClusterUrl extends TestnetUrl
      ? IRpcTransportTestnet
      : TClusterUrl extends MainnetUrl
        ? IRpcTransportMainnet
        : IRpcTransport;

export interface IRpcWebSocketTransport {
    (config: RpcWebSocketTransportConfig): Promise<
        Readonly<
            Omit<RpcWebSocketConnection, 'send'> & {
                send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: RpcWebSocketConnection['send'];
            }
        >
    >;
}
/**
 * Public RPC API.
 */
export type IRpcApi<TRpcMethods> = {
    [MethodName in keyof TRpcMethods]: RpcReturnTypeMapper<TRpcMethods[MethodName]>;
};
export type IRpcSubscriptionsApi<TRpcSubscriptionMethods> = {
    [MethodName in keyof TRpcSubscriptionMethods]: RpcSubscriptionReturnTypeMapper<TRpcSubscriptionMethods[MethodName]>;
};

export type Rpc<TRpcMethods> = RpcMethods<TRpcMethods>;
export type RpcDevnet<TRpcMethods> = RpcMethods<TRpcMethods> & { '~cluster': 'devnet' };
export type RpcTestnet<TRpcMethods> = RpcMethods<TRpcMethods> & { '~cluster': 'testnet' };
export type RpcMainnet<TRpcMethods> = RpcMethods<TRpcMethods> & { '~cluster': 'mainnet' };
export type RpcFromTransport<
    TRpcMethods,
    TRpcTransport extends IIRpcTransport,
> = TRpcTransport extends IRpcTransportDevnet
    ? RpcDevnet<TRpcMethods>
    : TRpcTransport extends IRpcTransportTestnet
      ? RpcTestnet<TRpcMethods>
      : TRpcTransport extends IRpcTransportMainnet
        ? RpcMainnet<TRpcMethods>
        : Rpc<TRpcMethods>;

export type RpcSubscriptions<TRpcSubscriptionMethods> = RpcSubscriptionMethods<TRpcSubscriptionMethods>;

/**
 * Public RPC API methods.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcApiMethod = (...args: any) => any;
export interface IRpcApiMethods {
    [methodName: string]: RpcApiMethod;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcApiSubscription = (...args: any) => any;
export interface IRpcApiSubscriptions {
    [notificationName: string]: RpcApiSubscription;
}

/**
 * Public pending RPC request API.
 */
export type RpcRequest<TResponse> = {
    methodName: string;
    params: unknown[];
    responseTransformer?: (response: unknown, methodName: string) => TResponse;
};
export type RpcSubscription<TResponse> = {
    params: unknown[];
    responseTransformer?: (response: unknown, notificationName: string) => TResponse;
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
type RpcReturnTypeMapper<TRpcMethod> = TRpcMethod extends Callable
    ? (...rawParams: unknown[]) => RpcRequest<ReturnType<TRpcMethod>>
    : never;
type RpcSubscriptionReturnTypeMapper<TRpcMethod> = TRpcMethod extends Callable
    ? (...rawParams: unknown[]) => RpcSubscription<ReturnType<TRpcMethod>>
    : never;
type RpcMethods<TRpcMethods> = {
    [TMethodName in keyof TRpcMethods]: PendingRpcRequestBuilder<ApiMethodImplementations<TRpcMethods, TMethodName>>;
};
type RpcSubscriptionMethods<TRpcSubscriptionMethods> = {
    [TMethodName in keyof TRpcSubscriptionMethods]: PendingRpcSubscriptionBuilder<
        ApiMethodImplementations<TRpcSubscriptionMethods, TMethodName>
    >;
};
type ApiMethodImplementations<TRpcMethods, TMethod extends keyof TRpcMethods> = Overloads<TRpcMethods[TMethod]>;
type PendingRpcRequestReturnTypeMapper<TMethodImplementation> =
    // Check that this property of the TRpcMethods interface is, in fact, a function.
    TMethodImplementation extends Callable
        ? (...args: Parameters<TMethodImplementation>) => PendingRpcRequest<ReturnType<TMethodImplementation>>
        : never;
type PendingRpcRequestBuilder<TMethodImplementations> = UnionToIntersection<
    Flatten<{
        [P in keyof TMethodImplementations]: PendingRpcRequestReturnTypeMapper<TMethodImplementations[P]>;
    }>
>;
type PendingRpcSubscriptionReturnTypeMapper<TSubscriptionMethodImplementation> =
    // Check that this property of the TRpcSubscriptionMethods interface is, in fact, a function.
    TSubscriptionMethodImplementation extends Callable
        ? (
              ...args: Parameters<TSubscriptionMethodImplementation>
          ) => PendingRpcSubscription<ReturnType<TSubscriptionMethodImplementation>>
        : never;
type PendingRpcSubscriptionBuilder<TSubscriptionMethodImplementations> = UnionToIntersection<
    Flatten<{
        [P in keyof TSubscriptionMethodImplementations]: PendingRpcSubscriptionReturnTypeMapper<
            TSubscriptionMethodImplementations[P]
        >;
    }>
>;

/**
 * Rpc Response helper.
 */
export type RpcResponse<TValue> = Readonly<{
    context: Readonly<{ slot: Slot }>;
    value: TValue;
}>;

/**
 * Utility types that do terrible, awful things.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callable = (...args: any[]) => any;
type Flatten<T> = T extends (infer Item)[] ? Item : never;
type UnionToIntersection<T> = (T extends unknown ? (x: T) => unknown : never) extends (x: infer R) => unknown
    ? R
    : never;

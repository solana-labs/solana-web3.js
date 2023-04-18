import { IRpcTransport } from './transports/transport-types';

/**
 * Public API.
 */
export type IRpcApi<TRpcMethods> = {
    [MethodName in keyof TRpcMethods]: TRpcMethods[MethodName] extends Callable
        ? (...rawParams: unknown[]) => RpcRequest<ReturnType<TRpcMethods[MethodName]>>
        : never;
};
export type SendOptions = Readonly<{
    abortSignal?: AbortSignal;
}>;
export type Rpc<TRpcMethods> = RpcMethods<TRpcMethods>;
export type RpcConfig<TRpcMethods> = Readonly<{
    api: IRpcApi<TRpcMethods>;
    transport: IRpcTransport;
}>;
export type RpcRequest<TResponse> = {
    methodName: string;
    params: unknown[];
    responseProcessor?: (response: unknown) => TResponse;
};
export interface ArmedRpcOwnMethods<TResponse> {
    send(options?: SendOptions): Promise<TResponse>;
}
export type ArmedRpc<TRpcMethods, TResponse> = ArmedRpcMethods<TRpcMethods, TResponse> & ArmedRpcOwnMethods<TResponse>;
export interface ArmedBatchRpcOwnMethods<TResponses> {
    sendBatch(options?: SendOptions): Promise<TResponses>;
}
export type ArmedBatchRpc<TRpcMethods, TResponses extends unknown[]> = ArmedBatchRpcMethods<TRpcMethods, TResponses> &
    ArmedBatchRpcOwnMethods<TResponses>;

/**
 * Private RPC-building types.
 */
type RpcMethods<TRpcMethods> = {
    [TMethodName in keyof TRpcMethods]: ArmedRpcReturner<
        TRpcMethods,
        ApiMethodImplementations<TRpcMethods, TMethodName>
    >;
};
type ArmedRpcMethods<TRpcMethods, TResponse> = ArmedBatchRpcMethods<TRpcMethods, [TResponse]>;
type ArmedBatchRpcMethods<TRpcMethods, TResponses extends unknown[]> = {
    [TMethodName in keyof TRpcMethods]: ArmedBatchRpcReturner<
        TRpcMethods,
        ApiMethodImplementations<TRpcMethods, TMethodName>,
        TResponses
    >;
};
type ApiMethodImplementations<TRpcMethods, TMethod extends keyof TRpcMethods> = Overloads<TRpcMethods[TMethod]>;
type ArmedRpcReturner<TRpcMethods, TMethodImplementations> = UnionToIntersection<
    Flatten<{
        // Check that this property of the TRpcMethods interface is, in fact, a function.
        [P in keyof TMethodImplementations]: TMethodImplementations[P] extends Callable
            ? (
                  ...args: Parameters<TMethodImplementations[P]>
              ) => ArmedRpc<TRpcMethods, ReturnType<TMethodImplementations[P]>>
            : never;
    }>
>;
type ArmedBatchRpcReturner<TRpcMethods, TMethodImplementations, TResponses extends unknown[]> = UnionToIntersection<
    Flatten<{
        // Check that this property of the TRpcMethods interface is, in fact, a function.
        [P in keyof TMethodImplementations]: TMethodImplementations[P] extends Callable
            ? (
                  ...args: Parameters<TMethodImplementations[P]>
              ) => ArmedBatchRpc<TRpcMethods, [...TResponses, ReturnType<TMethodImplementations[P]>]>
            : never;
    }>
>;

/**
 * Utility types that do terrible, awful things.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callable = (...args: any[]) => any;
type Flatten<T> = T extends (infer Item)[] ? Item : never;
type Overloads<T> =
    // Have an RPC method with more than 5 overloads? Add another section and update this comment
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3;
        (...args: infer A4): infer R4;
        (...args: infer A5): infer R5;
    }
        ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3, (...args: A4) => R4, (...args: A5) => R5]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
          }
        ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3, (...args: A4) => R4]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
          }
        ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
          }
        ? [(...args: A1) => R1, (...args: A2) => R2]
        : T extends {
              (...args: infer A1): infer R1;
          }
        ? [(...args: A1) => R1]
        : unknown;
type UnionToIntersection<T> = (T extends unknown ? (x: T) => unknown : never) extends (x: infer R) => unknown
    ? R
    : never;

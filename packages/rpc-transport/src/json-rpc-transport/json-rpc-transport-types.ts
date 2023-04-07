/**
 * Public API.
 */
export type IRpcApi<TRpcMethods> = {
    [MethodName in keyof TRpcMethods]: TRpcMethods[MethodName] extends Callable
        ? (...rawParams: unknown[]) => TransportRequest<ReturnType<TRpcMethods[MethodName]>>
        : never;
};
export type Transport<TRpcMethods> = TransportMethods<TRpcMethods>;
export type TransportConfig<TRpcMethods> = Readonly<{
    api: IRpcApi<TRpcMethods>;
    url: string;
}>;
export type TransportRequest<TResponse> = {
    methodName: string;
    params: unknown[];
    responseProcessor?: (response: unknown) => TResponse;
};
export interface ArmedTransportOwnMethods<TResponse> {
    send(): Promise<TResponse>;
}
export type ArmedTransport<TRpcMethods, TResponse> = ArmedTransportMethods<TRpcMethods, TResponse> &
    ArmedTransportOwnMethods<TResponse>;
export interface ArmedBatchTransportOwnMethods<TResponses> {
    sendBatch(): Promise<TResponses>;
}
export type ArmedBatchTransport<TRpcMethods, TResponses extends unknown[]> = ArmedBatchTransportMethods<
    TRpcMethods,
    TResponses
> &
    ArmedBatchTransportOwnMethods<TResponses>;

/**
 * Private transport-building types.
 */
type TransportMethods<TRpcMethods> = {
    [TMethodName in keyof TRpcMethods]: ArmedTransportReturner<
        TRpcMethods,
        ApiMethodImplementations<TRpcMethods, TMethodName>
    >;
};
type ArmedTransportMethods<TRpcMethods, TResponse> = ArmedBatchTransportMethods<TRpcMethods, [TResponse]>;
type ArmedBatchTransportMethods<TRpcMethods, TResponses extends unknown[]> = {
    [TMethodName in keyof TRpcMethods]: ArmedBatchTransportReturner<
        TRpcMethods,
        ApiMethodImplementations<TRpcMethods, TMethodName>,
        TResponses
    >;
};
type ApiMethodImplementations<TRpcMethods, TMethod extends keyof TRpcMethods> = Overloads<TRpcMethods[TMethod]>;
type ArmedTransportReturner<TRpcMethods, TMethodImplementations> = UnionToIntersection<
    Flatten<{
        // Check that this property of the TRpcMethods interface is, in fact, a function.
        [P in keyof TMethodImplementations]: TMethodImplementations[P] extends Callable
            ? (
                  ...args: Parameters<TMethodImplementations[P]>
              ) => ArmedTransport<TRpcMethods, ReturnType<TMethodImplementations[P]>>
            : never;
    }>
>;
type ArmedBatchTransportReturner<
    TRpcMethods,
    TMethodImplementations,
    TResponses extends unknown[]
> = UnionToIntersection<
    Flatten<{
        // Check that this property of the TRpcMethods interface is, in fact, a function.
        [P in keyof TMethodImplementations]: TMethodImplementations[P] extends Callable
            ? (
                  ...args: Parameters<TMethodImplementations[P]>
              ) => ArmedBatchTransport<TRpcMethods, [...TResponses, ReturnType<TMethodImplementations[P]>]>
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

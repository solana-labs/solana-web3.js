/**
 * Public API.
 */
export type Transport<TApi> = TransportMethods<TApi>;
export type ArmedTransport<Api, TResponse> = ArmedTransportMethods<Api, TResponse> & {
    send(): Promise<TResponse>;
};
export type ArmedBatchTransport<Api, TResponses extends unknown[]> = ArmedBatchTransportMethods<Api, TResponses> & {
    sendBatch(): Promise<TResponses>;
};

/**
 * Private transport-building types.
 */
type TransportMethods<TApi> = {
    [TMethodName in keyof TApi]: ArmedTransportReturner<TApi, ApiMethodImplementations<TApi, TMethodName>>;
};
type ArmedTransportMethods<TApi, TResponse> = {
    [TMethodName in keyof TApi]: ArmedBatchTransportReturner<
        TApi,
        ApiMethodImplementations<TApi, TMethodName>,
        [TResponse]
    >;
};
type ArmedBatchTransportMethods<TApi, TResponses extends unknown[]> = {
    [TMethodName in keyof TApi]: ArmedBatchTransportReturner<
        TApi,
        ApiMethodImplementations<TApi, TMethodName>,
        TResponses
    >;
};
type ApiMethodImplementations<TApi, TMethod extends keyof TApi> = Overloads<TApi[TMethod]>;
type ArmedTransportReturner<TApi, TMethodImplementations> = UnionToIntersection<
    Flatten<{
        // Check that this property of the TApi interface is, in fact, a function.
        [P in keyof TMethodImplementations]: TMethodImplementations[P] extends Callable
            ? (
                  ...args: Parameters<TMethodImplementations[P]>
              ) => ArmedTransport<TApi, ReturnType<TMethodImplementations[P]>>
            : never;
    }>
>;
type ArmedBatchTransportReturner<TApi, TMethodImplementations, TResponses extends unknown[]> = UnionToIntersection<
    Flatten<{
        // Check that this property of the TApi interface is, in fact, a function.
        [P in keyof TMethodImplementations]: TMethodImplementations[P] extends Callable
            ? (
                  ...args: Parameters<TMethodImplementations[P]>
              ) => ArmedBatchTransport<TApi, [...TResponses, ReturnType<TMethodImplementations[P]>]>
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
    // Have an RPC method with more than 3 overloads? Add another section and update this comment
    T extends {
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

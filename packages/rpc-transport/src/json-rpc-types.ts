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
    [TMethodName in keyof TRpcMethods]: PendingRpcRequestBuilder<ApiMethodImplementations<TRpcMethods, TMethodName>>;
};
type RpcSubscriptionMethods<TRpcSubscriptionMethods> = {
    [TMethodName in keyof TRpcSubscriptionMethods]: PendingRpcSubscriptionBuilder<
        ApiMethodImplementations<TRpcSubscriptionMethods, TMethodName>
    >;
};
type ApiMethodImplementations<TRpcMethods, TMethod extends keyof TRpcMethods> = Overloads<TRpcMethods[TMethod]>;
type PendingRpcRequestBuilder<TMethodImplementations> = UnionToIntersection<
    Flatten<{
        // Check that this property of the TRpcMethods interface is, in fact, a function.
        [P in keyof TMethodImplementations]: TMethodImplementations[P] extends Callable
            ? (
                  ...args: Parameters<TMethodImplementations[P]>
              ) => PendingRpcRequest<ReturnType<TMethodImplementations[P]>>
            : never;
    }>
>;
type PendingRpcSubscriptionBuilder<TSubscriptionMethodImplementations> = UnionToIntersection<
    Flatten<{
        // Check that this property of the TRpcSubscriptionMethods interface is, in fact, a function.
        [P in keyof TSubscriptionMethodImplementations]: TSubscriptionMethodImplementations[P] extends Callable
            ? (
                  ...args: Parameters<TSubscriptionMethodImplementations[P]>
              ) => PendingRpcSubscription<ReturnType<TSubscriptionMethodImplementations[P]>>
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
    // Have an RPC method with more than 24 overloads? Add another section and update this comment
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3;
        (...args: infer A4): infer R4;
        (...args: infer A5): infer R5;
        (...args: infer A6): infer R6;
        (...args: infer A7): infer R7;
        (...args: infer A8): infer R8;
        (...args: infer A9): infer R9;
        (...args: infer A10): infer R10;
        (...args: infer A11): infer R11;
        (...args: infer A12): infer R12;
        (...args: infer A13): infer R13;
        (...args: infer A14): infer R14;
        (...args: infer A15): infer R15;
        (...args: infer A16): infer R16;
        (...args: infer A17): infer R17;
        (...args: infer A18): infer R18;
        (...args: infer A19): infer R19;
        (...args: infer A20): infer R20;
        (...args: infer A21): infer R21;
        (...args: infer A22): infer R22;
        (...args: infer A23): infer R23;
        (...args: infer A24): infer R24;
    }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15,
              (...args: A16) => R16,
              (...args: A17) => R17,
              (...args: A18) => R18,
              (...args: A19) => R19,
              (...args: A20) => R20,
              (...args: A21) => R21,
              (...args: A22) => R22,
              (...args: A23) => R23,
              (...args: A24) => R24
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
              (...args: infer A14): infer R14;
              (...args: infer A15): infer R15;
              (...args: infer A16): infer R16;
              (...args: infer A17): infer R17;
              (...args: infer A18): infer R18;
              (...args: infer A19): infer R19;
              (...args: infer A20): infer R20;
              (...args: infer A21): infer R21;
              (...args: infer A22): infer R22;
              (...args: infer A23): infer R23;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15,
              (...args: A16) => R16,
              (...args: A17) => R17,
              (...args: A18) => R18,
              (...args: A19) => R19,
              (...args: A20) => R20,
              (...args: A21) => R21,
              (...args: A22) => R22,
              (...args: A23) => R23
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
              (...args: infer A14): infer R14;
              (...args: infer A15): infer R15;
              (...args: infer A16): infer R16;
              (...args: infer A17): infer R17;
              (...args: infer A18): infer R18;
              (...args: infer A19): infer R19;
              (...args: infer A20): infer R20;
              (...args: infer A21): infer R21;
              (...args: infer A22): infer R22;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15,
              (...args: A16) => R16,
              (...args: A17) => R17,
              (...args: A18) => R18,
              (...args: A19) => R19,
              (...args: A20) => R20,
              (...args: A21) => R21,
              (...args: A22) => R22
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
              (...args: infer A14): infer R14;
              (...args: infer A15): infer R15;
              (...args: infer A16): infer R16;
              (...args: infer A17): infer R17;
              (...args: infer A18): infer R18;
              (...args: infer A19): infer R19;
              (...args: infer A20): infer R20;
              (...args: infer A21): infer R21;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15,
              (...args: A16) => R16,
              (...args: A17) => R17,
              (...args: A18) => R18,
              (...args: A19) => R19,
              (...args: A20) => R20,
              (...args: A21) => R21
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
              (...args: infer A14): infer R14;
              (...args: infer A15): infer R15;
              (...args: infer A16): infer R16;
              (...args: infer A17): infer R17;
              (...args: infer A18): infer R18;
              (...args: infer A19): infer R19;
              (...args: infer A20): infer R20;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15,
              (...args: A16) => R16,
              (...args: A17) => R17,
              (...args: A18) => R18,
              (...args: A19) => R19,
              (...args: A20) => R20
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
              (...args: infer A14): infer R14;
              (...args: infer A15): infer R15;
              (...args: infer A16): infer R16;
              (...args: infer A17): infer R17;
              (...args: infer A18): infer R18;
              (...args: infer A19): infer R19;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15,
              (...args: A16) => R16,
              (...args: A17) => R17,
              (...args: A18) => R18,
              (...args: A19) => R19
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
              (...args: infer A14): infer R14;
              (...args: infer A15): infer R15;
              (...args: infer A16): infer R16;
              (...args: infer A17): infer R17;
              (...args: infer A18): infer R18;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15,
              (...args: A16) => R16,
              (...args: A17) => R17,
              (...args: A18) => R18
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
              (...args: infer A14): infer R14;
              (...args: infer A15): infer R15;
              (...args: infer A16): infer R16;
              (...args: infer A17): infer R17;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15,
              (...args: A16) => R16,
              (...args: A17) => R17
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
              (...args: infer A14): infer R14;
              (...args: infer A15): infer R15;
              (...args: infer A16): infer R16;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15,
              (...args: A16) => R16
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
              (...args: infer A14): infer R14;
              (...args: infer A15): infer R15;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
              (...args: infer A14): infer R14;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
              (...args: infer A13): infer R13;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
              (...args: infer A12): infer R12;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
              (...args: infer A11): infer R11;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
              (...args: infer A10): infer R10;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
              (...args: infer A9): infer R9;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
              (...args: infer A8): infer R8;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
              (...args: infer A7): infer R7;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7
          ]
        : T extends {
              (...args: infer A1): infer R1;
              (...args: infer A2): infer R2;
              (...args: infer A3): infer R3;
              (...args: infer A4): infer R4;
              (...args: infer A5): infer R5;
              (...args: infer A6): infer R6;
          }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6
          ]
        : T extends {
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

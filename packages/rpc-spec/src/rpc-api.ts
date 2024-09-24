import { Callable } from '@solana/rpc-spec-types';

import { RpcRequest, RpcRequestTransformer, RpcResponse, RpcResponseTransformer } from './rpc-shared';

export type RpcApiConfig = Readonly<{
    requestTransformer?: RpcRequestTransformer;
    responseTransformer?: RpcResponseTransformer;
}>;

export type RpcApiRequestPlan<TResponse> = RpcRequest & {
    responseTransformer?: (response: RpcResponse) => RpcResponse<TResponse>;
};

export type RpcApi<TRpcMethods> = {
    [MethodName in keyof TRpcMethods]: RpcReturnTypeMapper<TRpcMethods[MethodName]>;
};

type RpcReturnTypeMapper<TRpcMethod> = TRpcMethod extends Callable
    ? (...rawParams: unknown[]) => RpcApiRequestPlan<ReturnType<TRpcMethod>>
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcApiMethod = (...args: any) => any;
interface RpcApiMethods {
    [methodName: string]: RpcApiMethod;
}

export function createRpcApi<TRpcMethods extends RpcApiMethods>(config?: RpcApiConfig): RpcApi<TRpcMethods> {
    return new Proxy({} as RpcApi<TRpcMethods>, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get<TMethodName extends keyof RpcApi<TRpcMethods>>(
            ...args: Parameters<NonNullable<ProxyHandler<RpcApi<TRpcMethods>>['get']>>
        ) {
            const [_, p] = args;
            const methodName = p.toString() as keyof TRpcMethods as string;
            return function (
                ...rawParams: Parameters<
                    TRpcMethods[TMethodName] extends CallableFunction ? TRpcMethods[TMethodName] : never
                >
            ): RpcApiRequestPlan<ReturnType<TRpcMethods[TMethodName]>> {
                const rawRequest = Object.freeze({ methodName, params: rawParams });
                const request = config?.requestTransformer ? config?.requestTransformer(rawRequest) : rawRequest;
                return Object.freeze({
                    ...request,
                    ...(config?.responseTransformer
                        ? {
                              responseTransformer: (response: RpcResponse) => {
                                  const configTransformer = config.responseTransformer as RpcResponseTransformer<
                                      ReturnType<TRpcMethods[TMethodName]>
                                  >;
                                  return configTransformer(response, request);
                              },
                          }
                        : {}),
                });
            };
        },
    });
}

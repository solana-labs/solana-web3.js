import { Callable } from '@solana/rpc-spec-types';

import { RpcRequest } from './rpc-request';

export type RpcApiConfig = Readonly<{
    parametersTransformer?: <T extends unknown[]>(params: T, methodName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, methodName: string) => T;
}>;

export type RpcApi<TRpcMethods> = {
    [MethodName in keyof TRpcMethods]: RpcReturnTypeMapper<TRpcMethods[MethodName]>;
};

type RpcReturnTypeMapper<TRpcMethod> = TRpcMethod extends Callable
    ? (...rawParams: unknown[]) => RpcRequest<ReturnType<TRpcMethod>>
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcApiMethod = (...args: any) => any;
export interface RpcApiMethods {
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
            ): RpcRequest<ReturnType<TRpcMethods[TMethodName]>> {
                const params = config?.parametersTransformer
                    ? config?.parametersTransformer(rawParams, methodName)
                    : rawParams;
                const responseTransformer = config?.responseTransformer
                    ? config?.responseTransformer<ReturnType<TRpcMethods[TMethodName]>>
                    : (rawResponse: unknown) => rawResponse as ReturnType<TRpcMethods[TMethodName]>;
                return {
                    methodName,
                    params,
                    responseTransformer,
                };
            };
        },
    });
}

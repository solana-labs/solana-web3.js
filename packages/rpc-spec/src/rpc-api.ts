import {
    Callable,
    createRpcMessage,
    RpcRequestTransformer,
    RpcResponse,
    RpcResponseTransformer,
} from '@solana/rpc-spec-types';

import type { RpcTransport } from './rpc-transport';

export type RpcApiConfig = Readonly<{
    requestTransformer?: RpcRequestTransformer;
    responseTransformer?: RpcResponseTransformer;
}>;

export type RpcPlan<TResponse> = {
    execute: (
        config: Readonly<{
            signal?: AbortSignal;
            transport: RpcTransport;
        }>,
    ) => Promise<RpcResponse<TResponse>>;
};

export type RpcApi<TRpcMethods> = {
    [MethodName in keyof TRpcMethods]: RpcReturnTypeMapper<TRpcMethods[MethodName]>;
};

type RpcReturnTypeMapper<TRpcMethod> = TRpcMethod extends Callable
    ? (...rawParams: unknown[]) => RpcPlan<ReturnType<TRpcMethod>>
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcApiMethod = (...args: any) => any;
interface RpcApiMethods {
    [methodName: string]: RpcApiMethod;
}

export function createJsonRpcApi<TRpcMethods extends RpcApiMethods>(config?: RpcApiConfig): RpcApi<TRpcMethods> {
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
            ): RpcPlan<ReturnType<TRpcMethods[TMethodName]>> {
                const rawRequest = Object.freeze({ methodName, params: rawParams });
                const request = config?.requestTransformer ? config?.requestTransformer(rawRequest) : rawRequest;
                return Object.freeze(<RpcPlan<ReturnType<TRpcMethods[TMethodName]>>>{
                    execute: async ({ signal, transport }) => {
                        const payload = createRpcMessage(request);
                        const response = await transport({ payload, signal });
                        if (!config?.responseTransformer) {
                            return response;
                        }
                        return config.responseTransformer(response, request);
                    },
                });
            };
        },
    });
}

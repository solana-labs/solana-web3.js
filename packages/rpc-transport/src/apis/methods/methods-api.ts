import { IRpcApi, IRpcApiDevnet, IRpcApiMainnet, IRpcApiTestnet, RpcRequest } from '../../json-rpc-types';
import {
    IRpcApiMethods,
    IRpcApiMethodsDevnet,
    IRpcApiMethodsMainnet,
    IRpcApiMethodsTestnet,
    RpcApiConfig,
} from '../api-types';

export function createJsonRpcApi<TRpcMethods extends IRpcApiMethods>(
    config?: RpcApiConfig,
): TRpcMethods extends IRpcApiMethodsDevnet<TRpcMethods>
    ? IRpcApiDevnet<TRpcMethods>
    : TRpcMethods extends IRpcApiMethodsTestnet<TRpcMethods>
      ? IRpcApiTestnet<TRpcMethods>
      : TRpcMethods extends IRpcApiMethodsMainnet<TRpcMethods>
        ? IRpcApiMainnet<TRpcMethods>
        : IRpcApi<TRpcMethods> {
    return new Proxy({} as IRpcApi<TRpcMethods>, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get<TMethodName extends keyof IRpcApi<TRpcMethods>>(
            ...args: Parameters<NonNullable<ProxyHandler<IRpcApi<TRpcMethods>>['get']>>
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
    }) as TRpcMethods extends IRpcApiMethodsDevnet<TRpcMethods>
        ? IRpcApiDevnet<TRpcMethods>
        : TRpcMethods extends IRpcApiMethodsTestnet<TRpcMethods>
          ? IRpcApiTestnet<TRpcMethods>
          : TRpcMethods extends IRpcApiMethodsMainnet<TRpcMethods>
            ? IRpcApiMainnet<TRpcMethods>
            : IRpcApi<TRpcMethods>;
}

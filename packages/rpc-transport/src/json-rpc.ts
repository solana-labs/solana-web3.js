import { IRpcApiMethodsDevnet, IRpcApiMethodsMainnet, IRpcApiMethodsTestnet } from './apis/api-types';
import { SolanaJsonRpcError } from './json-rpc-errors';
import { createJsonRpcMessage } from './json-rpc-message';
import {
    PendingRpcRequest,
    Rpc,
    RpcConfig,
    RpcDevnet,
    RpcMainnet,
    RpcRequest,
    RpcTestnet,
    SendOptions,
} from './json-rpc-types';

interface IHasIdentifier {
    readonly id: number;
}
export type JsonRpcResponse<TResponse> = IHasIdentifier &
    Readonly<{ result: TResponse } | { error: { code: number; message: string; data?: unknown } }>;

function createPendingRpcRequest<TRpcMethods, TResponse>(
    rpcConfig: RpcConfig<TRpcMethods>,
    pendingRequest: RpcRequest<TResponse>,
): PendingRpcRequest<TResponse> {
    return {
        async send(options?: SendOptions): Promise<TResponse> {
            const { methodName, params, responseTransformer } = pendingRequest;
            const payload = createJsonRpcMessage(methodName, params);
            const response = await rpcConfig.transport<JsonRpcResponse<unknown>>({
                payload,
                signal: options?.abortSignal,
            });
            if ('error' in response) {
                throw new SolanaJsonRpcError(response.error);
            } else {
                return (
                    responseTransformer ? responseTransformer(response.result, methodName) : response.result
                ) as TResponse;
            }
        },
    };
}

function makeProxy<TRpcMethods>(rpcConfig: RpcConfig<TRpcMethods>): Rpc<TRpcMethods> {
    return new Proxy(rpcConfig.api, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get(target, p, receiver) {
            return function (...rawParams: unknown[]) {
                const methodName = p.toString();
                const createRpcRequest = Reflect.get(target, methodName, receiver);
                const newRequest = createRpcRequest
                    ? createRpcRequest(...rawParams)
                    : { methodName, params: rawParams };
                return createPendingRpcRequest(rpcConfig, newRequest);
            };
        },
    }) as Rpc<TRpcMethods>;
}

export function createJsonRpc<TRpcMethods>(
    rpcConfig: RpcConfig<TRpcMethods>,
): TRpcMethods extends IRpcApiMethodsDevnet<TRpcMethods>
    ? RpcDevnet<TRpcMethods>
    : TRpcMethods extends IRpcApiMethodsTestnet<TRpcMethods>
      ? RpcTestnet<TRpcMethods>
      : TRpcMethods extends IRpcApiMethodsMainnet<TRpcMethods>
        ? RpcMainnet<TRpcMethods>
        : Rpc<TRpcMethods> {
    return makeProxy(rpcConfig) as TRpcMethods extends IRpcApiMethodsDevnet<TRpcMethods>
        ? RpcDevnet<TRpcMethods>
        : TRpcMethods extends IRpcApiMethodsTestnet<TRpcMethods>
          ? RpcTestnet<TRpcMethods>
          : TRpcMethods extends IRpcApiMethodsMainnet<TRpcMethods>
            ? RpcMainnet<TRpcMethods>
            : Rpc<TRpcMethods>;
}

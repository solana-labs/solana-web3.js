import { getSolanaErrorFromJsonRpcError } from '@solana/errors';
import { RpcRequest, RpcResponse, RpcResponseTransformer } from '@solana/rpc-spec';

import { AllowedNumericKeypaths } from './response-transformer-allowed-numeric-values';
import { getBigIntUpcastVisitor } from './response-transformer-bigint-upcast';
import { getTreeWalker } from './tree-traversal';

export type ResponseTransformerConfig<TApi> = Readonly<{
    allowedNumericKeyPaths?: AllowedNumericKeypaths<TApi>;
}>;

type JsonRpcResponse = { error: Parameters<typeof getSolanaErrorFromJsonRpcError>[0] } | { result: unknown };

export function getDefaultResponseTransformerForSolanaRpc<TApi>(
    config?: ResponseTransformerConfig<TApi>,
): RpcResponseTransformer {
    return <T>(rawResponse: RpcResponse, request: RpcRequest): RpcResponse<T> => {
        return {
            ...rawResponse,
            json: async () => {
                const methodName = request.methodName as keyof TApi;
                const rawData = (await rawResponse.json()) as JsonRpcResponse;
                if ('error' in rawData) {
                    throw getSolanaErrorFromJsonRpcError(rawData.error);
                }
                const keyPaths =
                    config?.allowedNumericKeyPaths && methodName
                        ? config.allowedNumericKeyPaths[methodName]
                        : undefined;
                const traverse = getTreeWalker([getBigIntUpcastVisitor(keyPaths ?? [])]);
                const initialState = {
                    keyPath: [],
                };
                return traverse(rawData.result, initialState) as T;
            },
        };
    };
}

export function getDefaultResponseTransformerForSolanaRpcSubscriptions<TApi>(
    config?: ResponseTransformerConfig<TApi>,
): <T>(response: unknown, notificationName: string) => T {
    return <T>(rawResponse: unknown, notificationName: string): T => {
        const rawData = rawResponse as JsonRpcResponse;
        if ('error' in rawData) {
            throw getSolanaErrorFromJsonRpcError(rawData.error);
        }
        const keyPaths =
            config?.allowedNumericKeyPaths && notificationName
                ? config.allowedNumericKeyPaths[notificationName as keyof TApi]
                : undefined;
        const traverse = getTreeWalker([getBigIntUpcastVisitor(keyPaths ?? [])]);
        const initialState = {
            keyPath: [],
        };
        return traverse(rawData.result, initialState) as T;
    };
}

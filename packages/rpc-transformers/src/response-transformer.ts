import { getSolanaErrorFromJsonRpcError } from '@solana/errors';
import { RpcApiConfig } from '@solana/rpc-spec';

import { AllowedNumericKeypaths } from './response-transformer-allowed-numeric-values';
import { getBigIntUpcastVisitor } from './response-transformer-bigint-upcast';
import { getTreeWalker } from './tree-traversal';

export type ResponseTransformerConfig<TApi> = Readonly<{
    allowedNumericKeyPaths?: AllowedNumericKeypaths<TApi>;
}>;

type JsonRpcResponse = { error: Parameters<typeof getSolanaErrorFromJsonRpcError>[0] } | { result: unknown };

export function getDefaultResponseTransformerForSolanaRpc<TApi>(
    config?: ResponseTransformerConfig<TApi>,
): NonNullable<RpcApiConfig['responseTransformer']> {
    return (<T>(rawResponse: JsonRpcResponse, methodName?: keyof TApi): T => {
        if ('error' in rawResponse) {
            throw getSolanaErrorFromJsonRpcError(rawResponse.error);
        }
        const keyPaths =
            config?.allowedNumericKeyPaths && methodName ? config.allowedNumericKeyPaths[methodName] : undefined;
        const traverse = getTreeWalker([getBigIntUpcastVisitor(keyPaths ?? [])]);
        const initialState = {
            keyPath: [],
        };
        return traverse(rawResponse.result, initialState) as T;
    }) as NonNullable<RpcApiConfig['responseTransformer']>;
}

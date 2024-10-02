import { pipe } from '@solana/functional';
import { RpcRequest, RpcResponse, RpcResponseTransformer } from '@solana/rpc-spec';

import { AllowedNumericKeypaths } from './response-transformer-allowed-numeric-values';
import { getBigIntUpcastResponseTransformer, getBigIntUpcastVisitor } from './response-transformer-bigint-upcast';
import { getResultResponseTransformer } from './response-transformer-result';
import { getThrowSolanaErrorResponseTransformer } from './response-transformer-throw-solana-error';
import { getTreeWalker } from './tree-traversal';

export type ResponseTransformerConfig<TApi> = Readonly<{
    allowedNumericKeyPaths?: AllowedNumericKeypaths<TApi>;
}>;

export function getDefaultResponseTransformerForSolanaRpc<TApi>(
    config?: ResponseTransformerConfig<TApi>,
): RpcResponseTransformer {
    return (response: RpcResponse, request: RpcRequest): RpcResponse => {
        const methodName = request.methodName as keyof TApi;
        const keyPaths =
            config?.allowedNumericKeyPaths && methodName ? config.allowedNumericKeyPaths[methodName] : undefined;
        return pipe(
            response,
            r => getThrowSolanaErrorResponseTransformer()(r, request),
            r => getResultResponseTransformer()(r, request),
            r => getBigIntUpcastResponseTransformer(keyPaths ?? [])(r, request),
        );
    };
}

export function getDefaultResponseTransformerForSolanaRpcSubscriptions<TApi>(
    config?: ResponseTransformerConfig<TApi>,
): <T>(notification: unknown, notificationName: string) => T {
    return <T>(notification: unknown, notificationName: string): T => {
        const keyPaths =
            config?.allowedNumericKeyPaths && notificationName
                ? config.allowedNumericKeyPaths[notificationName as keyof TApi]
                : undefined;
        const traverse = getTreeWalker([getBigIntUpcastVisitor(keyPaths ?? [])]);
        const initialState = {
            keyPath: [],
        };
        return traverse(notification, initialState) as T;
    };
}

import { AllowedNumericKeypaths } from './response-transformer-allowed-numeric-values.js';
import { getBigIntUpcastVisitor } from './response-transformer-bigint-upcast.js';
import { getTreeWalker } from './tree-traversal.js';

export type ResponseTransformerConfig<TApi> = Readonly<{
    allowedNumericKeyPaths?: AllowedNumericKeypaths<TApi>;
}>;

export function getDefaultResponseTransformerForSolanaRpc<TApi>(config?: ResponseTransformerConfig<TApi>) {
    return <T>(rawResponse: unknown, methodName?: keyof TApi): T => {
        const keyPaths =
            config?.allowedNumericKeyPaths && methodName ? config.allowedNumericKeyPaths[methodName] : undefined;
        const traverse = getTreeWalker([getBigIntUpcastVisitor(keyPaths ?? [])]);
        const initialState = {
            keyPath: [],
        };
        return traverse(rawResponse, initialState) as T;
    };
}

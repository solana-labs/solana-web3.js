import { AllowedNumericKeypaths } from './response-transformer-allowed-numeric-values';
import { getBigIntUpcastVisitor } from './response-transformer-bigint-upcast';
import { getTreeWalker } from './tree-traversal';

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

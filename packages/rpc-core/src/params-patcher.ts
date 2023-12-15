import { downcastNodeToNumberIfBigint } from './params-patcher-bigint-downcast';
import { getIntegerOverflowNodeVisitor } from './params-patcher-integer-overflow';
import { getTreeWalker, KeyPath } from './tree-traversal';

export type ParamsPatcherConfig = Readonly<{
    onIntegerOverflow?: (methodName: string, keyPath: KeyPath, value: bigint) => void;
}>;

export function getParamsPatcherForSolanaLabsRpc(config?: ParamsPatcherConfig) {
    const handleIntegerOverflow = config?.onIntegerOverflow;
    return <T>(rawParams: T, methodName: string) => {
        const traverse = getTreeWalker([
            ...(handleIntegerOverflow
                ? [getIntegerOverflowNodeVisitor((...args) => handleIntegerOverflow(methodName, ...args))]
                : []),
            downcastNodeToNumberIfBigint,
        ]);
        const initialState = {
            keyPath: [],
        };
        return traverse(rawParams, initialState);
    };
}

import { Commitment } from '@solana/rpc-types';

import { applyDefaultCommitment } from './default-commitment';
import { downcastNodeToNumberIfBigint } from './params-transformer-bigint-downcast';
import { getIntegerOverflowNodeVisitor } from './params-transformer-integer-overflow';
import { OPTIONS_OBJECT_POSITION_BY_METHOD } from './params-transformer-options-object-position-config';
import { getTreeWalker, KeyPath } from './tree-traversal';

export type ParamsTransformerConfig = Readonly<{
    defaultCommitment?: Commitment;
    onIntegerOverflow?: (methodName: string, keyPath: KeyPath, value: bigint) => void;
}>;

export function getDefaultParamsTransformerForSolanaRpc(config?: ParamsTransformerConfig) {
    const defaultCommitment = config?.defaultCommitment;
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
        const patchedParams = traverse(rawParams, initialState);
        if (!Array.isArray(patchedParams)) {
            return patchedParams;
        }
        const optionsObjectPositionInParams = OPTIONS_OBJECT_POSITION_BY_METHOD[methodName];
        if (optionsObjectPositionInParams == null) {
            return patchedParams;
        }
        return applyDefaultCommitment({
            commitmentPropertyName: methodName === 'sendTransaction' ? 'preflightCommitment' : 'commitment',
            optionsObjectPositionInParams,
            overrideCommitment: defaultCommitment,
            params: patchedParams,
        });
    };
}

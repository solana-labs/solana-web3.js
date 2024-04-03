import { pipe } from '@solana/functional';
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
        return pipe(
            patchedParams,
            params =>
                applyDefaultCommitment({
                    commitmentPropertyName: methodName === 'sendTransaction' ? 'preflightCommitment' : 'commitment',
                    optionsObjectPositionInParams,
                    overrideCommitment: defaultCommitment,
                    params,
                }),
            // FIXME Remove when https://github.com/anza-xyz/agave/pull/483 is deployed.
            params =>
                methodName === 'sendTransaction'
                    ? applyFixForIssue479(params as [unknown, { skipPreflight?: boolean } | undefined])
                    : params,
        );
    };
}

// See https://github.com/anza-xyz/agave/issues/479
function applyFixForIssue479(params: [unknown, { skipPreflight?: boolean } | undefined]) {
    if (params[1]?.skipPreflight !== true) {
        return params;
    }
    return [params[0], { ...params[1], preflightCommitment: 'processed' }, ...params.slice(2)];
}

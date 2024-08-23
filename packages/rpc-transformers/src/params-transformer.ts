import { pipe } from '@solana/functional';
import { RpcRequest, RpcRequestTransformer } from '@solana/rpc-spec';
import { Commitment } from '@solana/rpc-types';

import { applyDefaultCommitment } from './default-commitment';
import { downcastNodeToNumberIfBigint } from './params-transformer-bigint-downcast';
import { getIntegerOverflowNodeVisitor } from './params-transformer-integer-overflow';
import { OPTIONS_OBJECT_POSITION_BY_METHOD } from './params-transformer-options-object-position-config';
import { getTreeWalker, KeyPath } from './tree-traversal';

export type RequestTransformerConfig = Readonly<{
    defaultCommitment?: Commitment;
    onIntegerOverflow?: (methodName: string, keyPath: KeyPath, value: bigint) => void;
}>;

export function getDefaultRequestTransformerForSolanaRpc(config?: RequestTransformerConfig): RpcRequestTransformer {
    const defaultCommitment = config?.defaultCommitment;
    const handleIntegerOverflow = config?.onIntegerOverflow;
    return <T>(request: RpcRequest): RpcRequest<T> => {
        const { params: rawParams, methodName } = request;
        const traverse = getTreeWalker([
            ...(handleIntegerOverflow
                ? [getIntegerOverflowNodeVisitor((...args) => handleIntegerOverflow(methodName, ...args))]
                : []),
            downcastNodeToNumberIfBigint,
        ]);
        const initialState = {
            keyPath: [],
        };
        const patchedRequest = { methodName, params: traverse(rawParams, initialState) as T };
        if (!Array.isArray(patchedRequest.params)) {
            return patchedRequest;
        }
        const optionsObjectPositionInParams = OPTIONS_OBJECT_POSITION_BY_METHOD[methodName];
        if (optionsObjectPositionInParams == null) {
            return patchedRequest;
        }
        return pipe(
            patchedRequest,
            ({ methodName, params }) => ({
                methodName,
                params: applyDefaultCommitment({
                    commitmentPropertyName: methodName === 'sendTransaction' ? 'preflightCommitment' : 'commitment',
                    optionsObjectPositionInParams,
                    overrideCommitment: defaultCommitment,
                    params: params as unknown[],
                }),
            }),
            // FIXME Remove when https://github.com/anza-xyz/agave/pull/483 is deployed.
            ({ methodName, params }) => ({
                methodName,
                params:
                    methodName === 'sendTransaction'
                        ? applyFixForIssue479(params as [unknown, { skipPreflight?: boolean } | undefined])
                        : params,
            }),
        ) as RpcRequest<T>;
    };
}

// See https://github.com/anza-xyz/agave/issues/479
function applyFixForIssue479(params: [unknown, { skipPreflight?: boolean } | undefined]) {
    if (params[1]?.skipPreflight !== true) {
        return params;
    }
    return [params[0], { ...params[1], preflightCommitment: 'processed' }, ...params.slice(2)];
}

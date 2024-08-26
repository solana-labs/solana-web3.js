import { pipe } from '@solana/functional';
import { RpcRequest, RpcRequestTransformer } from '@solana/rpc-spec';
import { Commitment } from '@solana/rpc-types';

import { downcastNodeToNumberIfBigint } from './params-transformer-bigint-downcast';
import { getIntegerOverflowNodeVisitor } from './params-transformer-integer-overflow';
import { getDefaultCommitmentRequestTransformer } from './request-transformer-default-commitment';
import { OPTIONS_OBJECT_POSITION_BY_METHOD } from './request-transformer-options-object-position-config';
import { getTreeWalker, KeyPath } from './tree-traversal';

export type RequestTransformerConfig = Readonly<{
    defaultCommitment?: Commitment;
    onIntegerOverflow?: (methodName: string, keyPath: KeyPath, value: bigint) => void;
}>;

export function getDefaultRequestTransformerForSolanaRpc(config?: RequestTransformerConfig): RpcRequestTransformer {
    const defaultCommitment = config?.defaultCommitment;
    const handleIntegerOverflow = config?.onIntegerOverflow;
    return (request: RpcRequest): RpcRequest => {
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
        const patchedRequest = { methodName, params: traverse(rawParams, initialState) };
        return pipe(
            patchedRequest,
            getDefaultCommitmentRequestTransformer({
                defaultCommitment,
                optionsObjectPositionByMethod: OPTIONS_OBJECT_POSITION_BY_METHOD,
            }),
            // FIXME Remove when https://github.com/anza-xyz/agave/pull/483 is deployed.
            getFixForIssue479RequestTransformer(),
        );
    };
}

// See https://github.com/anza-xyz/agave/issues/479
function getFixForIssue479RequestTransformer(): RpcRequestTransformer {
    return <TParams>(request: RpcRequest<TParams>): RpcRequest => {
        if (request.methodName !== 'sendTransaction') {
            return request;
        }

        const params = request.params as [unknown, { skipPreflight?: boolean } | undefined];
        if (params[1]?.skipPreflight !== true) {
            return request;
        }

        return Object.freeze({
            ...request,
            params: [params[0], { ...params[1], preflightCommitment: 'processed' }, ...params.slice(2)],
        });
    };
}

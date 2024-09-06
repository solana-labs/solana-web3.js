import { pipe } from '@solana/functional';
import { RpcRequest, RpcRequestTransformer } from '@solana/rpc-spec';
import { Commitment } from '@solana/rpc-types';

import { getBigIntDowncastRequestTransformer } from './request-transformer-bigint-downcast';
import { getDefaultCommitmentRequestTransformer } from './request-transformer-default-commitment';
import { getIntegerOverflowRequestTransformer, IntegerOverflowHandler } from './request-transformer-integer-overflow';
import { OPTIONS_OBJECT_POSITION_BY_METHOD } from './request-transformer-options-object-position-config';

export type RequestTransformerConfig = Readonly<{
    defaultCommitment?: Commitment;
    onIntegerOverflow?: IntegerOverflowHandler;
}>;

export function getDefaultRequestTransformerForSolanaRpc(config?: RequestTransformerConfig): RpcRequestTransformer {
    const handleIntegerOverflow = config?.onIntegerOverflow;
    return (request: RpcRequest): RpcRequest => {
        return pipe(
            request,
            handleIntegerOverflow ? getIntegerOverflowRequestTransformer(handleIntegerOverflow) : r => r,
            getBigIntDowncastRequestTransformer(),
            getDefaultCommitmentRequestTransformer({
                defaultCommitment: config?.defaultCommitment,
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

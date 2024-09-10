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
        );
    };
}

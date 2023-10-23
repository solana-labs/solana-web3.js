import { Commitment, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

import { RpcResponse } from './common';

type GetStakeMinimumDelegationApiResponse = RpcResponse<LamportsUnsafeBeyond2Pow53Minus1>;

export interface GetStakeMinimumDelegationApi {
    /**
     * Returns the stake minimum delegation, in lamports.
     */
    getStakeMinimumDelegation(
        config?: Readonly<{
            commitment?: Commitment;
        }>
    ): GetStakeMinimumDelegationApiResponse;
}

import type { Commitment, IRpcApiMethods, LamportsUnsafeBeyond2Pow53Minus1, RpcResponse } from '@solana/rpc-types';

type GetStakeMinimumDelegationApiResponse = RpcResponse<LamportsUnsafeBeyond2Pow53Minus1>;

export interface GetStakeMinimumDelegationApi extends IRpcApiMethods {
    /**
     * Returns the stake minimum delegation, in lamports.
     */
    getStakeMinimumDelegation(
        config?: Readonly<{
            commitment?: Commitment;
        }>,
    ): GetStakeMinimumDelegationApiResponse;
}

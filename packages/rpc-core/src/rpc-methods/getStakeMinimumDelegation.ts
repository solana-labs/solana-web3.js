import { RpcResponse, U64UnsafeBeyond2Pow53Minus1, Commitment } from './common';

type GetStakeMinimumDelegationApiResponse = RpcResponse<U64UnsafeBeyond2Pow53Minus1>;

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

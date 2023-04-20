import { RpcResponse, Lamports, Commitment } from './common';

type GetStakeMinimumDelegationApiResponse = RpcResponse<Lamports>;

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

import type { Commitment, Lamports, SolanaRpcResponse } from '@solana/rpc-types';

type GetStakeMinimumDelegationApiResponse = Lamports;

export type GetStakeMinimumDelegationApi = {
    /**
     * Returns the stake minimum delegation, in lamports.
     */
    getStakeMinimumDelegation(
        config?: Readonly<{
            commitment?: Commitment;
        }>,
    ): SolanaRpcResponse<GetStakeMinimumDelegationApiResponse>;
};

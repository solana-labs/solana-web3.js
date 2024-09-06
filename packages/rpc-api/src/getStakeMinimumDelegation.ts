import type { Commitment, LamportsUnsafeBeyond2Pow53Minus1, SolanaRpcResponse } from '@solana/rpc-types';

type GetStakeMinimumDelegationApiResponse = LamportsUnsafeBeyond2Pow53Minus1;

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

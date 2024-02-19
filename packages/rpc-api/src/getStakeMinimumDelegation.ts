import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, LamportsUnsafeBeyond2Pow53Minus1, SolanaRpcResponse } from '@solana/rpc-types';

type GetStakeMinimumDelegationApiResponse = SolanaRpcResponse<LamportsUnsafeBeyond2Pow53Minus1>;

export interface GetStakeMinimumDelegationApi extends RpcApiMethods {
    /**
     * Returns the stake minimum delegation, in lamports.
     */
    getStakeMinimumDelegation(
        config?: Readonly<{
            commitment?: Commitment;
        }>,
    ): GetStakeMinimumDelegationApiResponse;
}

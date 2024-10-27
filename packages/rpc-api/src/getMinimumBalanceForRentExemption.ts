import type { Commitment, Lamports } from '@solana/rpc-types';

type GetMinimumBalanceForRentExemptionApiResponse = Lamports;

export type GetMinimumBalanceForRentExemptionApi = {
    /**
     * Returns the minimum balance to exempt an account of a certain size from rent
     */
    getMinimumBalanceForRentExemption(
        size: bigint,
        config?: Readonly<{
            commitment?: Commitment;
        }>,
    ): GetMinimumBalanceForRentExemptionApiResponse;
};

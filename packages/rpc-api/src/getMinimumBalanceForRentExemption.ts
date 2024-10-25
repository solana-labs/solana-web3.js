import type { Commitment, Lamports, U64 } from '@solana/rpc-types';

type GetMinimumBalanceForRentExemptionApiResponse = Lamports;

export type GetMinimumBalanceForRentExemptionApi = {
    /**
     * Returns the minimum balance to exempt an account of a certain size from rent
     */
    getMinimumBalanceForRentExemption(
        size: U64,
        config?: Readonly<{
            commitment?: Commitment;
        }>,
    ): GetMinimumBalanceForRentExemptionApiResponse;
};

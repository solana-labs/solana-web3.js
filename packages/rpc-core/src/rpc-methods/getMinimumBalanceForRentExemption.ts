import { Commitment, LamportsUnsafeBeyond2Pow53Minus1, U64UnsafeBeyond2Pow53Minus1 } from './common';

type GetMinimumBalanceForRentExemptionApiResponse = LamportsUnsafeBeyond2Pow53Minus1;

export interface GetMinimumBalanceForRentExemptionApi {
    /**
     * Returns the minimum balance to exempt an account of a certain size from rent
     */
    getMinimumBalanceForRentExemption(
        size: U64UnsafeBeyond2Pow53Minus1,
        config?: Readonly<{
            commitment?: Commitment;
        }>
    ): GetMinimumBalanceForRentExemptionApiResponse;
}

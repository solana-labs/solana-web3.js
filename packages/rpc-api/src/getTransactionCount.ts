import type { Commitment, Slot, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type GetTransactionCountApiResponse = U64UnsafeBeyond2Pow53Minus1;

export type GetTransactionCountApi = {
    /**
     * Returns the current Transaction count from the ledger
     */
    getTransactionCount(
        config?: Readonly<{
            // Defaults to `finalized`
            commitment?: Commitment;
            // The minimum slot that the request can be evaluated at
            minContextSlot?: Slot;
        }>,
    ): GetTransactionCountApiResponse;
};

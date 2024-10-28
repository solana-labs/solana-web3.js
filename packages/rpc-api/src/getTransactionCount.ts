import type { Commitment, Slot } from '@solana/rpc-types';

type GetTransactionCountApiResponse = bigint;

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

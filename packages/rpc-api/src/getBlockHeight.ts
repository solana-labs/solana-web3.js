import type { Commitment, Slot } from '@solana/rpc-types';

type GetBlockHeightApiResponse = bigint;

export type GetBlockHeightApi = {
    /**
     * Returns the current block height of the node
     */
    getBlockHeight(
        config?: Readonly<{
            // Defaults to `finalized`
            commitment?: Commitment;
            // The minimum slot that the request can be evaluated at
            minContextSlot?: Slot;
        }>,
    ): GetBlockHeightApiResponse;
};

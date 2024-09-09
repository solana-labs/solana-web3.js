import type { Commitment, Slot, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type GetBlockHeightApiResponse = U64UnsafeBeyond2Pow53Minus1;

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

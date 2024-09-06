import type { Slot, UnixTimestampUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

/** Estimated production time, as Unix timestamp (seconds since the Unix epoch) */
type GetBlockTimeApiResponse = UnixTimestampUnsafeBeyond2Pow53Minus1;

export type GetBlockTimeApi = {
    /**
     * Returns the estimated production time of a block.
     */
    getBlockTime(
        /** block number, identified by Slot */
        blockNumber: Slot,
    ): GetBlockTimeApiResponse;
};

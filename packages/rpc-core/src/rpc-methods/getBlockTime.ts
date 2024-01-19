import type { IRpcApiMethods, Slot, UnixTimestamp } from '@solana/rpc-types';

/** Estimated production time, as Unix timestamp (seconds since the Unix epoch) */
type GetBlockTimeApiResponse = UnixTimestamp;

export interface GetBlockTimeApi extends IRpcApiMethods {
    /**
     * Returns the estimated production time of a block.
     */
    getBlockTime(
        /** block number, identified by Slot */
        blockNumber: Slot,
    ): GetBlockTimeApiResponse;
}

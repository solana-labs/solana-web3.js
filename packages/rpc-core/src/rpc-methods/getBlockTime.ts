import { UnixTimestamp } from '@solana/rpc-types';

import { Slot } from './common';

/** Estimated production time, as Unix timestamp (seconds since the Unix epoch) */
type GetBlockTimeApiResponse = UnixTimestamp;

export interface GetBlockTimeApi {
    /**
     * Returns the estimated production time of a block.
     */
    getBlockTime(
        /** block number, identified by Slot */
        blockNumber: Slot
    ): GetBlockTimeApiResponse;
}

import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, Slot } from '@solana/rpc-types';

type GetBlocksWithLimitApiResponse = Slot[];

export interface GetBlocksWithLimitApi extends RpcApiMethods {
    /**
     * Returns a list of confirmed blocks starting at the given slot
     * for up to `limit` blocks
     */
    getBlocksWithLimit(
        startSlot: Slot,
        // The maximum number of blocks to return (between 0 and 500,000)
        // Note: 0 will return an empty array
        limit: number,
        config?: Readonly<{
            // Defaults to `finalized`
            commitment?: Exclude<Commitment, 'processed'>;
        }>,
    ): GetBlocksWithLimitApiResponse;
}

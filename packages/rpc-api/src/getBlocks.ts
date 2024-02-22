import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, Slot } from '@solana/rpc-types';

type GetBlocksApiResponse = Slot[];

export interface GetBlocksApi extends RpcApiMethods {
    /**
     * Returns a list of confirmed blocks between two slots
     */
    getBlocks(
        startSlot: Slot,
        endSlotInclusive?: Slot,
        config?: Readonly<{
            // Defaults to `finalized`
            commitment?: Exclude<Commitment, 'processed'>;
        }>,
    ): GetBlocksApiResponse;
}

import type { Commitment, IRpcApiMethods, Slot } from '@solana/rpc-types';

type GetSlotApiResponse = Slot;

export interface GetSlotApi extends IRpcApiMethods {
    /**
     * Returns the slot that has reached the given or default commitment level
     */
    getSlot(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): GetSlotApiResponse;
}

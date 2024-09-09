import type { Commitment, Slot } from '@solana/rpc-types';

type GetSlotApiResponse = Slot;

export type GetSlotApi = {
    /**
     * Returns the slot that has reached the given or default commitment level
     */
    getSlot(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): GetSlotApiResponse;
};

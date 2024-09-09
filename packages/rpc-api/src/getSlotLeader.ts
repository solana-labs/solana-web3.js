import type { Address } from '@solana/addresses';
import type { Commitment, Slot } from '@solana/rpc-types';

type GetSlotLeaderApiResponse = Address;

export type GetSlotLeaderApi = {
    /**
     * Returns the current slot leader
     */
    getSlotLeader(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): GetSlotLeaderApiResponse;
};

import type { Address } from '@solana/addresses';
import type { Commitment, IRpcApiMethods, Slot } from '@solana/rpc-types';

export interface GetSlotLeaderApi extends IRpcApiMethods {
    /**
     * Returns the current slot leader
     */
    getSlotLeader(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): Address;
}

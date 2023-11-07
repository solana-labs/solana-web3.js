import { Address } from '@solana/addresses';
import { Commitment } from '@solana/rpc-types';

import { Slot } from './common';

export interface GetSlotLeaderApi {
    /**
     * Returns the current slot leader
     */
    getSlotLeader(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>
    ): Address;
}

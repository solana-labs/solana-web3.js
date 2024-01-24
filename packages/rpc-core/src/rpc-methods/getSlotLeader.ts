import { Address } from '@solana/addresses';
import type { IRpcApiMethods } from '@solana/rpc-types';
import { Commitment } from '@solana/rpc-types';

import { Slot } from './common';

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

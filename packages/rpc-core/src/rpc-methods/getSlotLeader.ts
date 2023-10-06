import { Base58EncodedAddress } from '@solana/addresses';

import { Commitment } from '../commitment';
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
    ): Base58EncodedAddress;
}

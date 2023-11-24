import { Commitment } from '@solana/rpc-types';

import { Slot } from './common.js';

type GetSlotApiResponse = Slot;

export interface GetSlotApi {
    /**
     * Returns the slot that has reached the given or default commitment level
     */
    getSlot(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>
    ): GetSlotApiResponse;
}

import type { IRpcApiMethods } from '@solana/rpc-types';
import { Commitment } from '@solana/rpc-types';

import { Slot } from './common';

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

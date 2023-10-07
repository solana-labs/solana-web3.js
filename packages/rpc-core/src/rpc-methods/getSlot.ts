import { Commitment } from '../commitment';
import { Slot } from './common';

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

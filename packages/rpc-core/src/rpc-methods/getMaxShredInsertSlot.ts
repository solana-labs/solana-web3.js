import { Slot } from './common';

type GetMaxShredInsertSlotApiResponse = Slot;

export interface GetMaxShredInsertSlotApi {
    /**
     * Get the max slot seen from after shred insert.
     */
    getMaxShredInsertSlot(): GetMaxShredInsertSlotApiResponse;
}

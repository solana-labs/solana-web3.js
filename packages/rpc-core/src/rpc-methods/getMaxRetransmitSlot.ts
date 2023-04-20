import { Slot } from './common';

type GetMaxRetransmitSlotApiResponse = Slot;

export interface GetMaxRetransmitSlotApi {
    /**
     * Get the max slot seen from retransmit stage.
     */
    getMaxRetransmitSlot(): GetMaxRetransmitSlotApiResponse;
}

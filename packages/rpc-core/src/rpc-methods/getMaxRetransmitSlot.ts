import { RpcResponse, Slot } from './common';

type GetMaxRetransmitSlotApiResponse = RpcResponse<Slot>;

export interface GetMaxRetransmitSlotApi {
    /**
     * Get the max slot seen from retransmit stage.
     */
    getMaxRetransmitSlot(): GetMaxRetransmitSlotApiResponse;
}

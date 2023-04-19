import { RpcResponse, Slot } from './common';

type GetMaxShredInsertSlotApiResponse = RpcResponse<Slot>;

export interface GetMaxShredInsertSlotApi {
    /**
     * Get the max slot seen from after shred insert.
     */
    getMaxShredInsertSlot(): GetMaxShredInsertSlotApiResponse;
}

import { Commitment, RpcResponse, Slot } from './common';

type GetSlotApiResponse = RpcResponse<Slot>;

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

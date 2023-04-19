import { RpcResponse, Slot } from './common';

type GetFirstAvailableBlockApiResponse = RpcResponse<Slot>;

export interface GetFirstAvailableBlockApi {
    /**
     * Returns the slot of the lowest confirmed block that has not been purged from the ledger
     */
    getFirstAvailableBlock(): GetFirstAvailableBlockApiResponse;
}

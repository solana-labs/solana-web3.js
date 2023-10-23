import { Commitment } from '@solana/rpc-types';
import { Blockhash } from '@solana/transactions';

import { RpcResponse, Slot } from './common';

type IsBlockhashValidApiResponse = RpcResponse<boolean>;

export interface IsBlockhashValidApi {
    /**
     * Returns whether a blockhash is still valid or not
     */
    isBlockhashValid(
        /** query blockhash, as a base-58 encoded string */
        blockhash: Blockhash,
        config?: Readonly<{
            /** Defaults to `finalized` */
            commitment?: Commitment;
            /** The minimum slot that the request can be evaluated at */
            minContextSlot?: Slot;
        }>
    ): IsBlockhashValidApiResponse;
}

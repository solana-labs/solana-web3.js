import { Commitment } from '@solana/rpc-types';
import { Blockhash } from '@solana/transactions';

import { RpcResponse, Slot, U64UnsafeBeyond2Pow53Minus1 } from './common';

type GetLatestBlockhashApiResponse = RpcResponse<{
    /** a Hash as base-58 encoded string */
    blockhash: Blockhash;
    /** last block height at which the blockhash will be valid */
    lastValidBlockHeight: U64UnsafeBeyond2Pow53Minus1;
}>;

export interface GetLatestBlockhashApi {
    /**
     * Returns the latest blockhash
     */
    getLatestBlockhash(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>
    ): GetLatestBlockhashApiResponse;
}

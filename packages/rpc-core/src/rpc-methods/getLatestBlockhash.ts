import type {
    Blockhash,
    Commitment,
    IRpcApiMethods,
    RpcResponse,
    Slot,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';

type GetLatestBlockhashApiResponse = RpcResponse<{
    /** a Hash as base-58 encoded string */
    blockhash: Blockhash;
    /** last block height at which the blockhash will be valid */
    lastValidBlockHeight: U64UnsafeBeyond2Pow53Minus1;
}>;

export interface GetLatestBlockhashApi extends IRpcApiMethods {
    /**
     * Returns the latest blockhash
     */
    getLatestBlockhash(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): GetLatestBlockhashApiResponse;
}

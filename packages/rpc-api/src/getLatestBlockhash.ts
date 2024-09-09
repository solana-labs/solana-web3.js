import type { Blockhash, Commitment, Slot, SolanaRpcResponse, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type GetLatestBlockhashApiResponse = Readonly<{
    /** a Hash as base-58 encoded string */
    blockhash: Blockhash;
    /** last block height at which the blockhash will be valid */
    lastValidBlockHeight: U64UnsafeBeyond2Pow53Minus1;
}>;

export type GetLatestBlockhashApi = {
    /**
     * Returns the latest blockhash
     */
    getLatestBlockhash(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): SolanaRpcResponse<GetLatestBlockhashApiResponse>;
};

import type { Blockhash, Commitment, Slot, SolanaRpcResponse } from '@solana/rpc-types';

type GetLatestBlockhashApiResponse = Readonly<{
    /** a Hash as base-58 encoded string */
    blockhash: Blockhash;
    /** last block height at which the blockhash will be valid */
    lastValidBlockHeight: bigint;
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

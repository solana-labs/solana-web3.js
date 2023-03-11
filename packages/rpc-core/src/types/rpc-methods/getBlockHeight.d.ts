type GetBlockHeightApiResponse =
    // TODO(solana-labs/solana/issues/30341) Represent as bigint
    number;

export interface GetBlockHeightApi {
    /**
     * Returns the current block height of the node
     */
    getBlockHeight(
        config?: readonly {
            // Defaults to `finalized`
            commitment?: Commitment;
            // The minimum slot that the request can be evaluated at
            minContextSlot?: Slot;
        }
    ): Promise<GetBlockHeightApiResponse>;
}

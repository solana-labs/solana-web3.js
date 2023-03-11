type GetBlocksApiResponse = Slot[];

export interface GetBlocksApi {
    /**
     * Returns a list of confirmed blocks between two slots
     */
    getBlocks(
        startSlot: Slot,
        endSlotInclusive?: Slot,
        config?: readonly {
            // Defaults to `finalized`
            commitment?: Exclude<Commitment, 'processed'>;
        }
    ): Promise<GetBlocksApiResponse>;
}

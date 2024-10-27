import type { Commitment, Slot, U64 } from '@solana/rpc-types';

type GetEpochInfoApiResponse = Readonly<{
    /** the current slot */
    absoluteSlot: Slot;
    /** the current block height */
    blockHeight: U64;
    /** the current epoch */
    epoch: U64;
    /** the current slot relative to the start of the current epoch */
    slotIndex: U64;
    /** the number of slots in this epoch */
    slotsInEpoch: U64;
    /** total number of transactions processed without error since genesis */
    transactionCount: U64 | null;
}>;

export type GetEpochInfoApi = {
    /**
     * Returns the balance of the account of provided Pubkey
     */
    getEpochInfo(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): GetEpochInfoApiResponse;
};

import type { Slot } from '@solana/rpc-types';

type MinimumLedgerSlotApiResponse = Slot;

export type MinimumLedgerSlotApi = {
    /**
     * Returns the lowest slot that the node has information about in its ledger.
     * This value may increase over time if the node is configured to purge older ledger data.
     */
    minimumLedgerSlot(): MinimumLedgerSlotApiResponse;
};

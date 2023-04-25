import { Slot } from './common';

type MinimumLedgerSlotApiResponse = Slot;

export interface MinimumLedgerSlotApi {
    /**
     * Returns the lowest slot that the node has information about in its ledger.
     * This value may increase over time if the node is configured to purge older ledger data.
     */
    minimumLedgerSlot(): MinimumLedgerSlotApiResponse;
}

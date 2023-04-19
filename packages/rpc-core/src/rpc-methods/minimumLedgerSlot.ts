import { Slot } from './common';

type MinimumLedgerSlotApiResponse = Slot;

export interface MinimumLedgerSlotApi {
    /**
     * Returns the lowest slot that the node has information about in its ledger.
     */
    minimumLedgerSlot(): MinimumLedgerSlotApiResponse;
}

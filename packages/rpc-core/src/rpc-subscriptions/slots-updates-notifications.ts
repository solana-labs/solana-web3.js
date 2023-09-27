import { Slot, U64UnsafeBeyond2Pow53Minus1 } from '../rpc-methods/common';

type SlotsUpdatesNotificationsApiNotification = Readonly<{
    // Only present for 'createdBank' and notifications
    parent?: Slot;
    slot: Slot;
    timestamp: U64UnsafeBeyond2Pow53Minus1;
    type: 'completed' | 'createdBank' | 'dead' | 'firstShredReceived' | 'frozen' | 'optimisticConfirmation' | 'root';
}>;

export interface SlotsUpdatesNotificationsApi {
    /**
     * Subscribe to receive a notification from the validator on a variety of updates on every slot
     */
    slotsUpdatesNotifications(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>
    ): SlotsUpdatesNotificationsApiNotification;
}

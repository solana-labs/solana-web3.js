import type { Slot, U64 } from '@solana/rpc-types';

type SlotsUpdatesNotificationsApiNotificationBase = Readonly<{
    slot: Slot;
    timestamp: U64;
    type: 'completed' | 'firstShredReceived' | 'optimisticConfirmation' | 'root';
}>;

type SlotsUpdatesNotificationsApiNotificationCreatedBank = Readonly<{
    parent: Slot;
    type: 'createdBank';
}> &
    SlotsUpdatesNotificationsApiNotificationBase;

type SlotsUpdatesNotificationsApiNotificationDead = Readonly<{
    err: string;
    type: 'dead';
}> &
    SlotsUpdatesNotificationsApiNotificationBase;

type SlotsUpdatesNotificationsApiNotificationFrozen = Readonly<{
    stats: Readonly<{
        maxTransactionsPerEntry: U64;
        numFailedTransactions: U64;
        numSuccessfulTransactions: U64;
        numTransactionEntries: U64;
    }>;
    type: 'frozen';
}> &
    SlotsUpdatesNotificationsApiNotificationBase;

type SlotsUpdatesNotificationsApiNotification =
    | SlotsUpdatesNotificationsApiNotificationBase
    | SlotsUpdatesNotificationsApiNotificationCreatedBank
    | SlotsUpdatesNotificationsApiNotificationDead
    | SlotsUpdatesNotificationsApiNotificationFrozen;

export type SlotsUpdatesNotificationsApi = {
    /**
     * Subscribe to receive a notification from the validator on a variety of updates on every slot
     */
    slotsUpdatesNotifications(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): SlotsUpdatesNotificationsApiNotification;
};

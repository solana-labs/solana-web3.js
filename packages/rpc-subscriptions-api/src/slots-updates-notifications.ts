import type { Slot } from '@solana/rpc-types';

type SlotsUpdatesNotificationsApiNotificationBase = Readonly<{
    slot: Slot;
    timestamp: bigint;
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
        maxTransactionsPerEntry: bigint;
        numFailedTransactions: bigint;
        numSuccessfulTransactions: bigint;
        numTransactionEntries: bigint;
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

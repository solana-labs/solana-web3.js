import type { RpcSubscriptionsApiMethods } from '@solana/rpc-subscriptions-spec';
import type { Slot, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type SlotsUpdatesNotificationsApiNotificationBase = Readonly<{
    slot: Slot;
    timestamp: U64UnsafeBeyond2Pow53Minus1;
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
        maxTransactionsPerEntry: U64UnsafeBeyond2Pow53Minus1;
        numFailedTransactions: U64UnsafeBeyond2Pow53Minus1;
        numSuccessfulTransactions: U64UnsafeBeyond2Pow53Minus1;
        numTransactionEntries: U64UnsafeBeyond2Pow53Minus1;
    }>;
    type: 'frozen';
}> &
    SlotsUpdatesNotificationsApiNotificationBase;

type SlotsUpdatesNotificationsApiNotification =
    | SlotsUpdatesNotificationsApiNotificationBase
    | SlotsUpdatesNotificationsApiNotificationCreatedBank
    | SlotsUpdatesNotificationsApiNotificationDead
    | SlotsUpdatesNotificationsApiNotificationFrozen;

export interface SlotsUpdatesNotificationsApi extends RpcSubscriptionsApiMethods {
    /**
     * Subscribe to receive a notification from the validator on a variety of updates on every slot
     */
    slotsUpdatesNotifications(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): SlotsUpdatesNotificationsApiNotification;
}

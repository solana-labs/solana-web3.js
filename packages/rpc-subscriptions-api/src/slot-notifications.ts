import type { RpcSubscriptionsApiMethods } from '@solana/rpc-subscriptions-spec';
import type { Slot } from '@solana/rpc-types';

type SlotNotificationsApiNotification = Readonly<{
    parent: Slot;
    root: Slot;
    slot: Slot;
}>;

export interface SlotNotificationsApi extends RpcSubscriptionsApiMethods {
    /**
     * Subscribe to receive notification anytime a slot is processed by the validator
     */
    slotNotifications(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): SlotNotificationsApiNotification;
}

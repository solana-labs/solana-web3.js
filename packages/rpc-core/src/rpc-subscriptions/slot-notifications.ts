import { Slot } from '../rpc-methods/common';

type SlotNotificationsApiNotification = Readonly<{
    parent: Slot;
    root: Slot;
    slot: Slot;
}>;

export interface SlotNotificationsApi {
    /**
     * Subscribe to receive notification anytime a slot is processed by the validator
     */
    slotNotifications(): SlotNotificationsApiNotification;
}

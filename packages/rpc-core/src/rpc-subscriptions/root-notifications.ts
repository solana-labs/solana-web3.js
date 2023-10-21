import { Slot } from '../rpc-methods/common';

type RootNotificationsApiNotification = Slot;

export interface RootNotificationsApi {
    /**
     * Subscribe to receive notification anytime a new root is set by the validator
     */
    rootNotifications(): RootNotificationsApiNotification;
}

import { Slot } from '../rpc-methods/common';

type RootNotificationsApiNotification = Slot;

export interface RootNotificationsApi {
    /**
     * Subscribe to receive notification anytime a new root is set by the validator
     */
    rootNotifications(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>
    ): RootNotificationsApiNotification;
}

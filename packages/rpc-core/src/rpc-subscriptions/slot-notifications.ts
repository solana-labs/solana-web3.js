import { U64UnsafeBeyond2Pow53Minus1 } from '../rpc-methods/common';

type SlotNotificationsApiNotification = Readonly<{
    parent: U64UnsafeBeyond2Pow53Minus1;
    root: U64UnsafeBeyond2Pow53Minus1;
    slot: U64UnsafeBeyond2Pow53Minus1;
}>;

export interface SlotNotificationsApi {
    /**
     * Subscribe to receive notification anytime a slot is processed by the validator
     */
    slotNotifications(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>
    ): SlotNotificationsApiNotification;
}

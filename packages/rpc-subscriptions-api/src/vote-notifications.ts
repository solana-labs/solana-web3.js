import type { Address } from '@solana/addresses';
import type { Signature } from '@solana/keys';
import type { RpcSubscriptionsApiMethods } from '@solana/rpc-subscriptions-spec';
import type { Blockhash, Slot, UnixTimestamp } from '@solana/rpc-types';

type VoteNotificationsApiNotification = Readonly<{
    hash: Blockhash;
    signature: Signature;
    slots: readonly Slot[];
    timestamp: UnixTimestamp | null;
    votePubkey: Address;
}>;

export interface VoteNotificationsApi extends RpcSubscriptionsApiMethods {
    /**
     * Subscribe to receive a notification from the validator on a variety of updates on every slot
     */
    voteNotifications(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): VoteNotificationsApiNotification;
}

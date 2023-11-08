import { Address } from '@solana/addresses';
import { Signature } from '@solana/keys';
import { UnixTimestamp } from '@solana/rpc-types';
import { Blockhash } from '@solana/transactions';

import { Slot } from '../rpc-methods/common';

type VoteNotificationsApiNotification = Readonly<{
    hash: Blockhash;
    signature: Signature;
    slots: readonly Slot[];
    timestamp: UnixTimestamp | null;
    votePubkey: Address;
}>;

export interface VoteNotificationsApi {
    /**
     * Subscribe to receive a notification from the validator on a variety of updates on every slot
     */
    voteNotifications(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>
    ): VoteNotificationsApiNotification;
}

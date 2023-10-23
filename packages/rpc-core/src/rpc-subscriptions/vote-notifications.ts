import { Base58EncodedAddress } from '@solana/addresses';
import { UnixTimestamp } from '@solana/rpc-types';
import { Blockhash } from '@solana/transactions';
import { TransactionSignature } from '@solana/transactions';

import { Slot } from '../rpc-methods/common';

type VoteNotificationsApiNotification = Readonly<{
    hash: Blockhash;
    signature: TransactionSignature;
    slots: readonly Slot[];
    timestamp: UnixTimestamp | null;
    votePubkey: Base58EncodedAddress;
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

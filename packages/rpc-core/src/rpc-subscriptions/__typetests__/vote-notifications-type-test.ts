/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Base58EncodedAddress } from '@solana/addresses';
import { PendingRpcSubscription, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { Blockhash } from '@solana/transactions';

import { Slot } from '../../rpc-methods/common';
import { TransactionSignature } from '../../transaction-signature';
import { UnixTimestamp } from '../../unix-timestamp';
import { VoteNotificationsApi } from '../vote-notifications';

async () => {
    const rpcSubscriptions = null as unknown as RpcSubscriptions<VoteNotificationsApi>;

    type VoteNotificationsApiNotification = Readonly<{
        hash: Blockhash;
        signature: TransactionSignature;
        slots: readonly Slot[];
        timestamp: UnixTimestamp | null;
        votePubkey: Base58EncodedAddress;
    }>;
    rpcSubscriptions.voteNotifications() satisfies PendingRpcSubscription<VoteNotificationsApiNotification>;
    rpcSubscriptions.voteNotifications().subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<VoteNotificationsApiNotification>
    >;

    // @ts-expect-error Takes no params.
    rpcSubscriptions.voteNotifications({ commitment: 'finalized' });
};

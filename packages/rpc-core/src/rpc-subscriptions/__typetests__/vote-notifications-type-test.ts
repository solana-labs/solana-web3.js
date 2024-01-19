/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Address } from '@solana/addresses';
import { Signature } from '@solana/keys';
import type { Blockhash, PendingRpcSubscription, RpcSubscriptions, Slot, UnixTimestamp } from '@solana/rpc-types';

import { VoteNotificationsApi } from '../vote-notifications';

async () => {
    const rpcSubscriptions = null as unknown as RpcSubscriptions<VoteNotificationsApi>;

    type VoteNotificationsApiNotification = Readonly<{
        hash: Blockhash;
        signature: Signature;
        slots: readonly Slot[];
        timestamp: UnixTimestamp | null;
        votePubkey: Address;
    }>;
    rpcSubscriptions.voteNotifications() satisfies PendingRpcSubscription<VoteNotificationsApiNotification>;
    rpcSubscriptions.voteNotifications().subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<VoteNotificationsApiNotification>
    >;

    // @ts-expect-error Takes no params.
    rpcSubscriptions.voteNotifications({ commitment: 'finalized' });
};

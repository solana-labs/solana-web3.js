/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { Address } from '@solana/addresses';
import type { Signature } from '@solana/keys';
import type { PendingRpcSubscriptionsRequest, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import type { Blockhash, Slot, UnixTimestamp } from '@solana/rpc-types';

import { VoteNotificationsApi } from '../vote-notifications';

const rpcSubscriptions = null as unknown as RpcSubscriptions<VoteNotificationsApi>;

type VoteNotificationsApiNotification = Readonly<{
    hash: Blockhash;
    signature: Signature;
    slots: readonly Slot[];
    timestamp: UnixTimestamp | null;
    votePubkey: Address;
}>;
rpcSubscriptions.voteNotifications() satisfies PendingRpcSubscriptionsRequest<VoteNotificationsApiNotification>;
rpcSubscriptions.voteNotifications().subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<VoteNotificationsApiNotification>
>;

// @ts-expect-error Takes no params.
rpcSubscriptions.voteNotifications({ commitment: 'finalized' });

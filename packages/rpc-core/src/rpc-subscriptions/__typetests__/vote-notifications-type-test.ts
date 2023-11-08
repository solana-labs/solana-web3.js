/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Address } from '@solana/addresses';
import { Signature } from '@solana/keys';
import { PendingRpcSubscription, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { UnixTimestamp } from '@solana/rpc-types';
import { Blockhash } from '@solana/transactions';

import { Slot } from '../../rpc-methods/common';
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

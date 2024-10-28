/* eslint-disable @typescript-eslint/no-floating-promises */
import type { PendingRpcSubscriptionsRequest, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import type { Slot } from '@solana/rpc-types';

import type { SlotsUpdatesNotificationsApi } from '../slots-updates-notifications';

const rpcSubscriptions = null as unknown as RpcSubscriptions<SlotsUpdatesNotificationsApi>;

type TNotification = Readonly<{
    parent?: Slot;
    slot: Slot;
    timestamp: bigint;
    type: 'completed' | 'createdBank' | 'dead' | 'firstShredReceived' | 'frozen' | 'optimisticConfirmation' | 'root';
}>;
rpcSubscriptions.slotsUpdatesNotifications() satisfies PendingRpcSubscriptionsRequest<TNotification>;
rpcSubscriptions.slotsUpdatesNotifications().subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<TNotification>
>;

// @ts-expect-error Takes no params.
rpcSubscriptions.slotsUpdatesNotifications({ commitment: 'finalized' });

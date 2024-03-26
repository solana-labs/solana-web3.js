/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { PendingRpcSubscriptionsRequest, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import type { Slot } from '@solana/rpc-types';

import type { RootNotificationsApi } from '../root-notifications';

const rpcSubscriptions = null as unknown as RpcSubscriptions<RootNotificationsApi>;

type TNotification = Slot;
rpcSubscriptions.rootNotifications() satisfies PendingRpcSubscriptionsRequest<TNotification>;
rpcSubscriptions.rootNotifications().subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<TNotification>
>;

// @ts-expect-error Takes no params.
rpcSubscriptions.rootNotifications({ commitment: 'finalized' });

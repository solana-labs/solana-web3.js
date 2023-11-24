/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { PendingRpcSubscription, RpcSubscriptions } from '@solana/rpc-transport';

import { Slot } from '../../rpc-methods/common.js';
import { RootNotificationsApi } from '../root-notifications.js';

async () => {
    const rpcSubscriptions = null as unknown as RpcSubscriptions<RootNotificationsApi>;

    type TNotification = Slot;
    rpcSubscriptions.rootNotifications() satisfies PendingRpcSubscription<TNotification>;
    rpcSubscriptions.rootNotifications().subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<TNotification>
    >;

    // @ts-expect-error Takes no params.
    rpcSubscriptions.rootNotifications({ commitment: 'finalized' });
};

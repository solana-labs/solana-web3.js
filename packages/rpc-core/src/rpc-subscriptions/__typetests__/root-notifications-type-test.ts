/* eslint-disable @typescript-eslint/ban-ts-comment */

import { PendingRpcSubscription, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { Slot } from '../../rpc-methods/common';
import { RootNotificationsApi } from '../root-notifications';

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

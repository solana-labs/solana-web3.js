/* eslint-disable @typescript-eslint/ban-ts-comment */

import { PendingRpcSubscription, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { Slot } from '../../rpc-methods/common';
import { UnixTimestamp } from '../../unix-timestamp';
import { SlotsUpdatesNotificationsApi } from '../slots-updates-notifications';

async () => {
    const rpcSubscriptions = null as unknown as RpcSubscriptions<SlotsUpdatesNotificationsApi>;

    type TNotification = Readonly<{
        parent?: Slot;
        slot: Slot;
        timestamp: UnixTimestamp;
        type:
            | 'completed'
            | 'createdBank'
            | 'dead'
            | 'firstShredReceived'
            | 'frozen'
            | 'optimisticConfirmation'
            | 'root';
    }>;
    rpcSubscriptions.slotsUpdatesNotifications() satisfies PendingRpcSubscription<TNotification>;
    rpcSubscriptions
        .slotsUpdatesNotifications()
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;

    // @ts-expect-error Takes no params.
    rpcSubscriptions.slotNotifications({ commitment: 'finalized' });
};

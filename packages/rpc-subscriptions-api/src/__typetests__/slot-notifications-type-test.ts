/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import type { Slot } from '@solana/rpc-types';

import type { SlotNotificationsApi } from '../slot-notifications';

async () => {
    const rpcSubcriptions = null as unknown as RpcSubscriptions<SlotNotificationsApi>;
    const slotNotifications = await rpcSubcriptions
        .slotNotifications()
        .subscribe({ abortSignal: new AbortController().signal });

    slotNotifications satisfies AsyncIterable<
        Readonly<{
            parent: Slot;
            root: Slot;
            slot: Slot;
        }>
    >;

    // @ts-expect-error Takes no params.
    rpcSubscriptions.slotNotifications({ commitment: 'finalized' });
};

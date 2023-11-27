/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { RpcSubscriptions } from '@solana/rpc-transport';

import { Slot } from '../../rpc-methods/common';
import { SolanaRpcSubscriptions } from '../index';

async () => {
    const rpcSubcriptions = null as unknown as RpcSubscriptions<SolanaRpcSubscriptions>;
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

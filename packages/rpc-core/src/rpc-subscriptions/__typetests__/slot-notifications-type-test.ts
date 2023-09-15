/* eslint-disable @typescript-eslint/ban-ts-comment */

import { RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { U64UnsafeBeyond2Pow53Minus1 } from '../../rpc-methods/common';
import { SolanaRpcSubscriptions } from '../index';

async () => {
    const rpcSubcriptions = null as unknown as RpcSubscriptions<SolanaRpcSubscriptions>;
    const slotNotifications = await rpcSubcriptions.slotNotifications().subscribe();

    slotNotifications satisfies AsyncIterable<
        Readonly<{
            parent: U64UnsafeBeyond2Pow53Minus1;
            root: U64UnsafeBeyond2Pow53Minus1;
            slot: U64UnsafeBeyond2Pow53Minus1;
        }>
    >;

    // @ts-expect-error Takes no params.
    rpcSubcriptions.slotNotifications({ commitment: 'finalized' });
};

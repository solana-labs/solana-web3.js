/* eslint-disable @typescript-eslint/ban-ts-comment */
import { GetEpochInfoApi, Rpc, RpcDevnet, RpcMainnet, RpcTestnet } from '@solana/rpc';
import {
    RpcSubscriptions,
    RpcSubscriptionsDevnet,
    RpcSubscriptionsMainnet,
    RpcSubscriptionsTestnet,
    SlotNotificationsApi,
} from '@solana/rpc-subscriptions';

import { createBlockHeightExceedencePromiseFactory } from '../confirmation-strategy-blockheight';

const rpc = null as unknown as Rpc<GetEpochInfoApi>;
const rpcDevnet = null as unknown as RpcDevnet<GetEpochInfoApi>;
const rpcTestnet = null as unknown as RpcTestnet<GetEpochInfoApi>;
const rpcMainnet = null as unknown as RpcMainnet<GetEpochInfoApi>;

const rpcSubscriptions = null as unknown as RpcSubscriptions<SlotNotificationsApi>;
const rpcSubscriptionsDevnet = null as unknown as RpcSubscriptionsDevnet<SlotNotificationsApi>;
const rpcSubscriptionsMainnet = null as unknown as RpcSubscriptionsMainnet<SlotNotificationsApi>;
const rpcSubscriptionsTestnet = null as unknown as RpcSubscriptionsTestnet<SlotNotificationsApi>;

// [DESCRIBE] createBlockHeightExceedencePromiseFactory
{
    {
        // It typechecks when the RPC clusters match.
        createBlockHeightExceedencePromiseFactory({ rpc, rpcSubscriptions });
        createBlockHeightExceedencePromiseFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        createBlockHeightExceedencePromiseFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        createBlockHeightExceedencePromiseFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsMainnet });
    }
    {
        // It typechecks when either RPC is generic.
        createBlockHeightExceedencePromiseFactory({ rpc, rpcSubscriptions });
        createBlockHeightExceedencePromiseFactory({ rpc: rpcDevnet, rpcSubscriptions });
        createBlockHeightExceedencePromiseFactory({ rpc: rpcTestnet, rpcSubscriptions });
        createBlockHeightExceedencePromiseFactory({ rpc: rpcMainnet, rpcSubscriptions });
        createBlockHeightExceedencePromiseFactory({ rpc, rpcSubscriptions: rpcSubscriptionsDevnet });
        createBlockHeightExceedencePromiseFactory({ rpc, rpcSubscriptions: rpcSubscriptionsTestnet });
        createBlockHeightExceedencePromiseFactory({ rpc, rpcSubscriptions: rpcSubscriptionsMainnet });
    }
    {
        // It fails to typecheck when explicit RPC clusters mismatch.
        // @ts-expect-error
        createBlockHeightExceedencePromiseFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        // @ts-expect-error
        createBlockHeightExceedencePromiseFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        createBlockHeightExceedencePromiseFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        createBlockHeightExceedencePromiseFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        createBlockHeightExceedencePromiseFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        createBlockHeightExceedencePromiseFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsTestnet });
    }
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { GetAccountInfoApi, Rpc, RpcDevnet, RpcMainnet, RpcTestnet } from '@solana/rpc';
import {
    AccountNotificationsApi,
    RpcSubscriptions,
    RpcSubscriptionsDevnet,
    RpcSubscriptionsMainnet,
    RpcSubscriptionsTestnet,
} from '@solana/rpc-subscriptions';

import { createNonceInvalidationPromiseFactory } from '../confirmation-strategy-nonce';

const rpc = null as unknown as Rpc<GetAccountInfoApi>;
const rpcDevnet = null as unknown as RpcDevnet<GetAccountInfoApi>;
const rpcTestnet = null as unknown as RpcTestnet<GetAccountInfoApi>;
const rpcMainnet = null as unknown as RpcMainnet<GetAccountInfoApi>;

const rpcSubscriptions = null as unknown as RpcSubscriptions<AccountNotificationsApi>;
const rpcSubscriptionsDevnet = null as unknown as RpcSubscriptionsDevnet<AccountNotificationsApi>;
const rpcSubscriptionsMainnet = null as unknown as RpcSubscriptionsMainnet<AccountNotificationsApi>;
const rpcSubscriptionsTestnet = null as unknown as RpcSubscriptionsTestnet<AccountNotificationsApi>;

// [DESCRIBE] createNonceInvalidationPromiseFactory
{
    {
        // It typechecks when the RPC clusters match.
        createNonceInvalidationPromiseFactory({ rpc, rpcSubscriptions });
        createNonceInvalidationPromiseFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        createNonceInvalidationPromiseFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        createNonceInvalidationPromiseFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsMainnet });
    }
    {
        // It typechecks when either RPC is generic.
        createNonceInvalidationPromiseFactory({ rpc, rpcSubscriptions });
        createNonceInvalidationPromiseFactory({ rpc: rpcDevnet, rpcSubscriptions });
        createNonceInvalidationPromiseFactory({ rpc: rpcTestnet, rpcSubscriptions });
        createNonceInvalidationPromiseFactory({ rpc: rpcMainnet, rpcSubscriptions });
        createNonceInvalidationPromiseFactory({ rpc, rpcSubscriptions: rpcSubscriptionsDevnet });
        createNonceInvalidationPromiseFactory({ rpc, rpcSubscriptions: rpcSubscriptionsTestnet });
        createNonceInvalidationPromiseFactory({ rpc, rpcSubscriptions: rpcSubscriptionsMainnet });
    }
    {
        // It fails to typecheck when explicit RPC clusters mismatch.
        // @ts-expect-error
        createNonceInvalidationPromiseFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        // @ts-expect-error
        createNonceInvalidationPromiseFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        createNonceInvalidationPromiseFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        createNonceInvalidationPromiseFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        createNonceInvalidationPromiseFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        createNonceInvalidationPromiseFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsTestnet });
    }
}

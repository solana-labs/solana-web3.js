/* eslint-disable @typescript-eslint/ban-ts-comment */
import { GetSignatureStatusesApi, Rpc, RpcDevnet, RpcMainnet, RpcTestnet } from '@solana/rpc';
import {
    RpcSubscriptions,
    RpcSubscriptionsDevnet,
    RpcSubscriptionsMainnet,
    RpcSubscriptionsTestnet,
    SignatureNotificationsApi,
} from '@solana/rpc-subscriptions';

import { createRecentSignatureConfirmationPromiseFactory } from '../confirmation-strategy-recent-signature';

const rpc = null as unknown as Rpc<GetSignatureStatusesApi>;
const rpcDevnet = null as unknown as RpcDevnet<GetSignatureStatusesApi>;
const rpcTestnet = null as unknown as RpcTestnet<GetSignatureStatusesApi>;
const rpcMainnet = null as unknown as RpcMainnet<GetSignatureStatusesApi>;

const rpcSubscriptions = null as unknown as RpcSubscriptions<SignatureNotificationsApi>;
const rpcSubscriptionsDevnet = null as unknown as RpcSubscriptionsDevnet<SignatureNotificationsApi>;
const rpcSubscriptionsMainnet = null as unknown as RpcSubscriptionsMainnet<SignatureNotificationsApi>;
const rpcSubscriptionsTestnet = null as unknown as RpcSubscriptionsTestnet<SignatureNotificationsApi>;

// [DESCRIBE] createRecentSignatureConfirmationPromiseFactory
{
    {
        // It typechecks when the RPC clusters match.
        createRecentSignatureConfirmationPromiseFactory({ rpc, rpcSubscriptions });
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsMainnet });
    }
    {
        // It typechecks when either RPC is generic.
        createRecentSignatureConfirmationPromiseFactory({ rpc, rpcSubscriptions });
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcDevnet, rpcSubscriptions });
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcTestnet, rpcSubscriptions });
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcMainnet, rpcSubscriptions });
        createRecentSignatureConfirmationPromiseFactory({ rpc, rpcSubscriptions: rpcSubscriptionsDevnet });
        createRecentSignatureConfirmationPromiseFactory({ rpc, rpcSubscriptions: rpcSubscriptionsTestnet });
        createRecentSignatureConfirmationPromiseFactory({ rpc, rpcSubscriptions: rpcSubscriptionsMainnet });
    }
    {
        // It fails to typecheck when explicit RPC clusters mismatch.
        // @ts-expect-error
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        // @ts-expect-error
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        createRecentSignatureConfirmationPromiseFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsTestnet });
    }
}

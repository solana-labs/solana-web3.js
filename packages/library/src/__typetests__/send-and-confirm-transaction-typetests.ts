/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    GetEpochInfoApi,
    GetSignatureStatusesApi,
    Rpc,
    RpcDevnet,
    RpcMainnet,
    RpcTestnet,
    SendTransactionApi,
} from '@solana/rpc';
import {
    RpcSubscriptions,
    RpcSubscriptionsDevnet,
    RpcSubscriptionsMainnet,
    RpcSubscriptionsTestnet,
    SignatureNotificationsApi,
    SlotNotificationsApi,
} from '@solana/rpc-subscriptions';

import { sendAndConfirmTransactionFactory } from '../send-and-confirm-transaction';

const rpc = null as unknown as Rpc<GetEpochInfoApi & GetSignatureStatusesApi & SendTransactionApi>;
const rpcDevnet = null as unknown as RpcDevnet<GetEpochInfoApi & GetSignatureStatusesApi & SendTransactionApi>;
const rpcTestnet = null as unknown as RpcTestnet<GetEpochInfoApi & GetSignatureStatusesApi & SendTransactionApi>;
const rpcMainnet = null as unknown as RpcMainnet<GetEpochInfoApi & GetSignatureStatusesApi & SendTransactionApi>;

const rpcSubscriptions = null as unknown as RpcSubscriptions<SignatureNotificationsApi & SlotNotificationsApi>;
const rpcSubscriptionsDevnet = null as unknown as RpcSubscriptionsDevnet<
    SignatureNotificationsApi & SlotNotificationsApi
>;
const rpcSubscriptionsMainnet = null as unknown as RpcSubscriptionsMainnet<
    SignatureNotificationsApi & SlotNotificationsApi
>;
const rpcSubscriptionsTestnet = null as unknown as RpcSubscriptionsTestnet<
    SignatureNotificationsApi & SlotNotificationsApi
>;

// [DESCRIBE] sendAndConfirmTransactionFactory
{
    {
        // It typechecks when the RPC clusters match.
        sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
        sendAndConfirmTransactionFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        sendAndConfirmTransactionFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        sendAndConfirmTransactionFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsMainnet });
    }
    {
        // It typechecks when either RPC is generic.
        sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
        sendAndConfirmTransactionFactory({ rpc: rpcDevnet, rpcSubscriptions });
        sendAndConfirmTransactionFactory({ rpc: rpcTestnet, rpcSubscriptions });
        sendAndConfirmTransactionFactory({ rpc: rpcMainnet, rpcSubscriptions });
    }
    {
        // It fails to typecheck when explicit RPC clusters mismatch.
        // @ts-expect-error
        sendAndConfirmTransactionFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        // @ts-expect-error
        sendAndConfirmTransactionFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        sendAndConfirmTransactionFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        sendAndConfirmTransactionFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        sendAndConfirmTransactionFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        sendAndConfirmTransactionFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsTestnet });
    }
}

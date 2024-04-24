/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    GetAccountInfoApi,
    GetSignatureStatusesApi,
    Rpc,
    RpcDevnet,
    RpcMainnet,
    RpcTestnet,
    SendTransactionApi,
} from '@solana/rpc';
import {
    AccountNotificationsApi,
    RpcSubscriptions,
    RpcSubscriptionsDevnet,
    RpcSubscriptionsMainnet,
    RpcSubscriptionsTestnet,
    SignatureNotificationsApi,
} from '@solana/rpc-subscriptions';

import { sendAndConfirmDurableNonceTransactionFactory } from '../send-and-confirm-durable-nonce-transaction';

const rpc = null as unknown as Rpc<GetAccountInfoApi & GetSignatureStatusesApi & SendTransactionApi>;
const rpcDevnet = null as unknown as RpcDevnet<GetAccountInfoApi & GetSignatureStatusesApi & SendTransactionApi>;
const rpcTestnet = null as unknown as RpcTestnet<GetAccountInfoApi & GetSignatureStatusesApi & SendTransactionApi>;
const rpcMainnet = null as unknown as RpcMainnet<GetAccountInfoApi & GetSignatureStatusesApi & SendTransactionApi>;

const rpcSubscriptions = null as unknown as RpcSubscriptions<AccountNotificationsApi & SignatureNotificationsApi>;
const rpcSubscriptionsDevnet = null as unknown as RpcSubscriptionsDevnet<
    AccountNotificationsApi & SignatureNotificationsApi
>;
const rpcSubscriptionsMainnet = null as unknown as RpcSubscriptionsMainnet<
    AccountNotificationsApi & SignatureNotificationsApi
>;
const rpcSubscriptionsTestnet = null as unknown as RpcSubscriptionsTestnet<
    AccountNotificationsApi & SignatureNotificationsApi
>;

// [DESCRIBE] sendAndConfirmDurableNonceTransactionFactory
{
    {
        // It typechecks when the RPC clusters match.
        sendAndConfirmDurableNonceTransactionFactory({ rpc, rpcSubscriptions });
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsMainnet });
    }
    {
        // It typechecks when either RPC is generic.
        sendAndConfirmDurableNonceTransactionFactory({ rpc, rpcSubscriptions });
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcDevnet, rpcSubscriptions });
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcTestnet, rpcSubscriptions });
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcMainnet, rpcSubscriptions });
    }
    {
        // It fails to typecheck when explicit RPC clusters mismatch.
        // @ts-expect-error
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        // @ts-expect-error
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        sendAndConfirmDurableNonceTransactionFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsTestnet });
    }
}

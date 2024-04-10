/* eslint-disable @typescript-eslint/ban-ts-comment */
import { GetSignatureStatusesApi, RequestAirdropApi, Rpc, RpcDevnet, RpcMainnet, RpcTestnet } from '@solana/rpc';
import {
    RpcSubscriptions,
    RpcSubscriptionsDevnet,
    RpcSubscriptionsMainnet,
    RpcSubscriptionsTestnet,
    SignatureNotificationsApi,
} from '@solana/rpc-subscriptions';

import { airdropFactory } from '../airdrop';

const rpc = null as unknown as Rpc<GetSignatureStatusesApi & RequestAirdropApi>;
const rpcDevnet = null as unknown as RpcDevnet<GetSignatureStatusesApi & RequestAirdropApi>;
const rpcTestnet = null as unknown as RpcTestnet<GetSignatureStatusesApi & RequestAirdropApi>;
const rpcMainnet = null as unknown as RpcMainnet<GetSignatureStatusesApi /* note lack of `RequestAirdropApi` here */>;
// No sense discriminating against RPCs who decide to offer mainnet airdrops!
const rpcMainnetWithAirdrop = null as unknown as RpcMainnet<GetSignatureStatusesApi & RequestAirdropApi>;

const rpcSubscriptions = null as unknown as RpcSubscriptions<SignatureNotificationsApi>;
const rpcSubscriptionsDevnet = null as unknown as RpcSubscriptionsDevnet<SignatureNotificationsApi>;
const rpcSubscriptionsMainnet = null as unknown as RpcSubscriptionsMainnet<SignatureNotificationsApi>;
const rpcSubscriptionsTestnet = null as unknown as RpcSubscriptionsTestnet<SignatureNotificationsApi>;

// [DESCRIBE] airdropFactory
{
    {
        // It typechecks when the RPC clusters match and have the `RequestAirdropApi`
        airdropFactory({ rpc, rpcSubscriptions });
        airdropFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        airdropFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        airdropFactory({ rpc: rpcMainnetWithAirdrop, rpcSubscriptions: rpcSubscriptionsMainnet });
    }
    {
        // It typechecks when either RPC is generic
        airdropFactory({ rpc, rpcSubscriptions });
        airdropFactory({ rpc: rpcDevnet, rpcSubscriptions });
        airdropFactory({ rpc: rpcTestnet, rpcSubscriptions });
        airdropFactory({ rpc, rpcSubscriptions: rpcSubscriptionsDevnet });
        airdropFactory({ rpc, rpcSubscriptions: rpcSubscriptionsTestnet });
    }
    {
        // It fails to typecheck when used with an RPC that doesn't have `RequestAirdropApi`
        // @ts-expect-error
        airdropFactory({ rpc: rpcMainnet, rpcSubscriptions: rpcSubscriptionsMainnet });
    }
    {
        // It fails to typecheck when explicit RPC clusters mismatch
        // @ts-expect-error
        airdropFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsTestnet });
        // @ts-expect-error
        airdropFactory({ rpc: rpcDevnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        airdropFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsMainnet });
        // @ts-expect-error
        airdropFactory({ rpc: rpcTestnet, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        airdropFactory({ rpc: rpcMainnetWithAirdrop, rpcSubscriptions: rpcSubscriptionsDevnet });
        // @ts-expect-error
        airdropFactory({ rpc: rpcMainnetWithAirdrop, rpcSubscriptions: rpcSubscriptionsTestnet });
    }
}

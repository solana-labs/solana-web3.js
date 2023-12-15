import {
    SolanaRpcMethodsDevnet,
    SolanaRpcMethodsMainnet,
    SolanaRpcMethodsTestnet,
    SolanaRpcSubscriptions,
    SolanaRpcSubscriptionsUnstable,
} from '@solana/rpc-core';
import { createJsonRpc, createJsonSubscriptionRpc, type RpcSubscriptions } from '@solana/rpc-transport';
import { Rpc, RpcDevnet, RpcMainnet, RpcTestnet } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { createSolanaRpc, createSolanaRpcSubscriptions, createSolanaRpcSubscriptions_UNSTABLE } from '../rpc';

const transport = null as unknown as Parameters<typeof createJsonRpc>[0]['transport'];

createSolanaRpc<SolanaRpcMethodsDevnet>({ transport }) satisfies Rpc<SolanaRpcMethodsDevnet>;
createSolanaRpc<SolanaRpcMethodsDevnet>({ transport }) satisfies RpcDevnet<SolanaRpcMethodsDevnet>;
// @ts-expect-error Should not be a testnet RPC
createSolanaRpc<SolanaRpcMethodsDevnet>({ transport }) satisfies RpcTestnet<SolanaRpcMethodsDevnet>;
// @ts-expect-error Should not be a mainnet RPC
createSolanaRpc<SolanaRpcMethodsDevnet>({ transport }) satisfies RpcMainnet<SolanaRpcMethodsDevnet>;

createSolanaRpc<SolanaRpcMethodsTestnet>({ transport }) satisfies Rpc<SolanaRpcMethodsTestnet>;
createSolanaRpc<SolanaRpcMethodsTestnet>({ transport }) satisfies RpcTestnet<SolanaRpcMethodsTestnet>;
// @ts-expect-error Should not be a devnet RPC
createSolanaRpc<SolanaRpcMethodsTestnet>({ transport }) satisfies RpcDevnet<SolanaRpcMethodsTestnet>;
// @ts-expect-error Should not be a mainnet RPC
createSolanaRpc<SolanaRpcMethodsTestnet>({ transport }) satisfies RpcMainnet<SolanaRpcMethodsTestnet>;

createSolanaRpc<SolanaRpcMethodsMainnet>({ transport }) satisfies Rpc<SolanaRpcMethodsMainnet>;
createSolanaRpc<SolanaRpcMethodsMainnet>({ transport }) satisfies RpcMainnet<SolanaRpcMethodsMainnet>;
// @ts-expect-error Should not be a devnet RPC
createSolanaRpc<SolanaRpcMethodsMainnet>({ transport }) satisfies RpcDevnet<SolanaRpcMethodsMainnet>;
// @ts-expect-error Should not be a testnet RPC
createSolanaRpc<SolanaRpcMethodsMainnet>({ transport }) satisfies RpcTestnet<SolanaRpcMethodsMainnet>;

const configSubscriptions = null as unknown as Omit<Parameters<typeof createJsonSubscriptionRpc>[0], 'api'>;

createSolanaRpcSubscriptions(configSubscriptions) satisfies RpcSubscriptions<SolanaRpcSubscriptions>;
// @ts-expect-error Should not have unstable subscriptions
createSolanaRpcSubscriptions(configSubscriptions) satisfies RpcSubscriptions<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;

createSolanaRpcSubscriptions_UNSTABLE(configSubscriptions) satisfies RpcSubscriptions<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;

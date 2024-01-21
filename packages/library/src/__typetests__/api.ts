import {
    RequestAirdropApi,
    SolanaRpcMethods,
    SolanaRpcMethodsDevnet,
    SolanaRpcMethodsMainnet,
    SolanaRpcMethodsTestnet,
    SolanaRpcSubscriptions,
    SolanaRpcSubscriptionsUnstable,
} from '@solana/rpc-core';
import { createHttpTransport, createJsonSubscriptionRpc } from '@solana/rpc-transport';
import {
    devnet,
    mainnet,
    type Rpc,
    type RpcDevnet,
    type RpcMainnet,
    type RpcSubscriptions,
    type RpcTestnet,
    testnet,
} from '@solana/rpc-types';

import { createSolanaRpc, createSolanaRpcSubscriptions, createSolanaRpcSubscriptions_UNSTABLE } from '../rpc';

// Method type tests

const genericTransport = createHttpTransport({ url: 'http://localhost:8899' });
const devnetTransport = createHttpTransport({ url: devnet('https://api.devnet.solana.com') });
const testnetTransport = createHttpTransport({ url: testnet('https://api.testnet.solana.com') });
const mainnetTransport = createHttpTransport({ url: mainnet('https://api.mainnet-beta.solana.com') });

// No cluster specified should be generic `Rpc`
createSolanaRpc({ transport: genericTransport }) satisfies Rpc<SolanaRpcMethods>;
//@ts-expect-error Should not be a devnet RPC
createSolanaRpc({ transport: genericTransport }) satisfies RpcDevnet<SolanaRpcMethods>;
//@ts-expect-error Should not be a testnet RPC
createSolanaRpc({ transport: genericTransport }) satisfies RpcTestnet<SolanaRpcMethods>;
//@ts-expect-error Should not be a mainnet RPC
createSolanaRpc({ transport: genericTransport }) satisfies RpcMainnet<SolanaRpcMethods>;

// Devnet cluster should be `RpcDevnet`
createSolanaRpc({ transport: devnetTransport }) satisfies Rpc<SolanaRpcMethods>;
createSolanaRpc({ transport: devnetTransport }) satisfies Rpc<SolanaRpcMethodsDevnet>;
createSolanaRpc({ transport: devnetTransport }) satisfies RpcDevnet<SolanaRpcMethods>;
createSolanaRpc({ transport: devnetTransport }) satisfies RpcDevnet<SolanaRpcMethodsDevnet>; // Same types
//@ts-expect-error Should not be a testnet RPC
createSolanaRpc({ transport: devnetTransport }) satisfies RpcTestnet<SolanaRpcMethods>;
//@ts-expect-error Should not be a mainnet RPC
createSolanaRpc({ transport: devnetTransport }) satisfies RpcMainnet<SolanaRpcMethods>;

// Testnet cluster should be `RpcTestnet`
createSolanaRpc({ transport: testnetTransport }) satisfies Rpc<SolanaRpcMethods>;
createSolanaRpc({ transport: testnetTransport }) satisfies Rpc<SolanaRpcMethodsTestnet>;
createSolanaRpc({ transport: testnetTransport }) satisfies RpcTestnet<SolanaRpcMethods>;
createSolanaRpc({ transport: testnetTransport }) satisfies RpcTestnet<SolanaRpcMethodsTestnet>; // Same types
//@ts-expect-error Should not be a devnet RPC
createSolanaRpc({ transport: testnetTransport }) satisfies RpcDevnet<SolanaRpcMethods>;
//@ts-expect-error Should not be a mainnet RPC
createSolanaRpc({ transport: testnetTransport }) satisfies RpcMainnet<SolanaRpcMethods>;

// Mainnet cluster should be `RpcMainnet`
createSolanaRpc({ transport: mainnetTransport }) satisfies Rpc<SolanaRpcMethodsMainnet>;
//@ts-expect-error Should not have `requestAirdrop` method
createSolanaRpc({ transport: mainnetTransport }) satisfies Rpc<SolanaRpcMethods>;
//@ts-expect-error Should not have `requestAirdrop` method
createSolanaRpc({ transport: mainnetTransport }) satisfies Rpc<RequestAirdropApi>;
//@ts-expect-error Should not be a devnet RPC
createSolanaRpc({ transport: mainnetTransport }) satisfies RpcDevnet<SolanaRpcMethods>;
//@ts-expect-error Should not be a testnet RPC
createSolanaRpc({ transport: mainnetTransport }) satisfies RpcTestnet<SolanaRpcMethods>;

// Subscription type tests

const configSubscriptions = null as unknown as Omit<Parameters<typeof createJsonSubscriptionRpc>[0], 'api'>;

createSolanaRpcSubscriptions(configSubscriptions) satisfies RpcSubscriptions<SolanaRpcSubscriptions>;
// @ts-expect-error Should not have unstable subscriptions
createSolanaRpcSubscriptions(configSubscriptions) satisfies RpcSubscriptions<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;

createSolanaRpcSubscriptions_UNSTABLE(configSubscriptions) satisfies RpcSubscriptions<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;

import type { SolanaRpcSubscriptionsApi, SolanaRpcSubscriptionsApiUnstable } from '@solana/rpc-subscriptions-api';
import type { RpcSubscriptions, RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';
import { devnet, mainnet, testnet } from '@solana/rpc-types';

import { createSolanaRpcSubscriptions, createSolanaRpcSubscriptions_UNSTABLE } from '../rpc-subscriptions';
import type {
    RpcSubscriptionsDevnet,
    RpcSubscriptionsMainnet,
    RpcSubscriptionsTestnet,
    RpcSubscriptionsTransportDevnet,
    RpcSubscriptionsTransportMainnet,
    RpcSubscriptionsTransportTestnet,
} from '../rpc-subscriptions-clusters';
import { createDefaultRpcSubscriptionsTransport } from '../rpc-subscriptions-transport';

// Creating default websocket transports

const genericUrl = 'http://localhost:8899';
const devnetUrl = devnet('https://api.devnet.solana.com');
const testnetUrl = testnet('https://api.testnet.solana.com');
const mainnetUrl = mainnet('https://api.mainnet-beta.solana.com');

// No cluster specified should be generic `RpcSubscriptionsTransport`
createDefaultRpcSubscriptionsTransport({ url: genericUrl }) satisfies RpcSubscriptionsTransport;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcSubscriptionsTransport({ url: genericUrl }) satisfies RpcSubscriptionsTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcSubscriptionsTransport({ url: genericUrl }) satisfies RpcSubscriptionsTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcSubscriptionsTransport({ url: genericUrl }) satisfies RpcSubscriptionsTransportMainnet;

// Devnet cluster should be `RpcSubscriptionsTransportDevnet`
createDefaultRpcSubscriptionsTransport({ url: devnetUrl }) satisfies RpcSubscriptionsTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcSubscriptionsTransport({ url: devnetUrl }) satisfies RpcSubscriptionsTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcSubscriptionsTransport({ url: devnetUrl }) satisfies RpcSubscriptionsTransportMainnet;

// Testnet cluster should be `RpcSubscriptionsTransportTestnet`
createDefaultRpcSubscriptionsTransport({ url: testnetUrl }) satisfies RpcSubscriptionsTransportTestnet;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcSubscriptionsTransport({ url: testnetUrl }) satisfies RpcSubscriptionsTransportDevnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcSubscriptionsTransport({ url: testnetUrl }) satisfies RpcSubscriptionsTransportMainnet;

// Mainnet cluster should be `RpcSubscriptionsTransportMainnet`
createDefaultRpcSubscriptionsTransport({ url: mainnetUrl }) satisfies RpcSubscriptionsTransportMainnet;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcSubscriptionsTransport({ url: mainnetUrl }) satisfies RpcSubscriptionsTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcSubscriptionsTransport({ url: mainnetUrl }) satisfies RpcSubscriptionsTransportTestnet;

// Creating JSON Subscription RPC clients

const genericWebSocketTransport = createDefaultRpcSubscriptionsTransport({
    sendBufferHighWatermark: 0,
    url: genericUrl,
});
const devnetWebSocketTransport = createDefaultRpcSubscriptionsTransport({
    sendBufferHighWatermark: 0,
    url: devnetUrl,
});
const testnetWebSocketTransport = createDefaultRpcSubscriptionsTransport({
    sendBufferHighWatermark: 0,
    url: testnetUrl,
});
const mainnetWebSocketTransport = createDefaultRpcSubscriptionsTransport({
    sendBufferHighWatermark: 0,
    url: mainnetUrl,
});

// Checking stable vs unstable subscriptions

createSolanaRpcSubscriptions({
    transport: genericWebSocketTransport,
}) satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
// @ts-expect-error Should not have unstable subscriptions
createSolanaRpcSubscriptions(config) satisfies RpcSubscriptions<
    SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
>;

createSolanaRpcSubscriptions_UNSTABLE({ transport: genericWebSocketTransport }) satisfies RpcSubscriptions<
    SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
>;

// Checking cluster-level subscriptions API

// No cluster specified should be generic `RpcSubscriptions`
createSolanaRpcSubscriptions({
    transport: genericWebSocketTransport,
}) satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: genericWebSocketTransport,
    //@ts-expect-error Should not be a devnet RPC
}) satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: genericWebSocketTransport,
    //@ts-expect-error Should not be a testnet RPC
}) satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: genericWebSocketTransport,
    //@ts-expect-error Should not be a mainnet RPC
}) satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;

// Devnet cluster should be `RpcSubscriptionsDevnet`
createSolanaRpcSubscriptions({
    transport: devnetWebSocketTransport,
}) satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: devnetWebSocketTransport,
}) satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: devnetWebSocketTransport,
    //@ts-expect-error Should not be a testnet RPC
}) satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: devnetWebSocketTransport,
    //@ts-expect-error Should not be a mainnet RPC
}) satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
//@ts-expect-error Should not have unstable subscriptions
createSolanaRpcSubscriptions({ transport: devnetWebSocketTransport }) satisfies RpcSubscriptionsDevnet<
    SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
>;
// Unstable methods present with proper initializer
createSolanaRpcSubscriptions_UNSTABLE({ transport: devnetWebSocketTransport }) satisfies RpcSubscriptionsDevnet<
    SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
>;

// Testnet cluster should be `RpcSubscriptionsTestnet`
createSolanaRpcSubscriptions({
    transport: testnetWebSocketTransport,
}) satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: testnetWebSocketTransport,
}) satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: testnetWebSocketTransport,
    //@ts-expect-error Should not be a devnet RPC
}) satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: testnetWebSocketTransport,
    //@ts-expect-error Should not be a mainnet RPC
}) satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
//@ts-expect-error Should not have unstable subscriptions
createSolanaRpcSubscriptions({ transport: testnetWebSocketTransport }) satisfies RpcSubscriptionsTestnet<
    SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
>;
// Unstable methods present with proper initializer
createSolanaRpcSubscriptions_UNSTABLE({ transport: testnetWebSocketTransport }) satisfies RpcSubscriptionsTestnet<
    SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
>;

// Mainnet cluster should be `RpcSubscriptionsMainnet`
createSolanaRpcSubscriptions({
    transport: mainnetWebSocketTransport,
}) satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: mainnetWebSocketTransport,
}) satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: mainnetWebSocketTransport,
    //@ts-expect-error Should not be a devnet RPC
}) satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
createSolanaRpcSubscriptions({
    transport: mainnetWebSocketTransport,
    //@ts-expect-error Should not be a testnet RPC
}) satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
//@ts-expect-error Should not have unstable subscriptions
createSolanaRpcSubscriptions({ transport: mainnetWebSocketTransport }) satisfies RpcSubscriptionsMainnet<
    SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
>;
// Unstable methods present with proper initializer
createSolanaRpcSubscriptions_UNSTABLE({ transport: mainnetWebSocketTransport }) satisfies RpcSubscriptionsMainnet<
    SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable
>;

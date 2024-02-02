import { SolanaRpcSubscriptions, SolanaRpcSubscriptionsUnstable } from '@solana/rpc-core';
import {
    createWebSocketTransport,
    IRpcWebSocketTransport,
    IRpcWebSocketTransportDevnet,
    IRpcWebSocketTransportMainnet,
    IRpcWebSocketTransportTestnet,
    RpcSubscriptionsDevnet,
    RpcSubscriptionsMainnet,
    RpcSubscriptionsTestnet,
} from '@solana/rpc-transport';
import { devnet, mainnet, RpcSubscriptions, testnet } from '@solana/rpc-types';

import { createSolanaRpcSubscriptions, createSolanaRpcSubscriptions_UNSTABLE } from '../rpc';
import { createDefaultRpcSubscriptionsTransport } from '../rpc-websocket-transport';

// Creating default websocket transports

const genericUrl = 'http://localhost:8899';
const devnetUrl = devnet('https://api.devnet.solana.com');
const testnetUrl = testnet('https://api.testnet.solana.com');
const mainnetUrl = mainnet('https://api.mainnet-beta.solana.com');

// No cluster specified should be generic `IRpcWebSocketTransport`
createDefaultRpcSubscriptionsTransport({ url: genericUrl }) satisfies IRpcWebSocketTransport;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcSubscriptionsTransport({ url: genericUrl }) satisfies IRpcWebSocketTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcSubscriptionsTransport({ url: genericUrl }) satisfies IRpcWebSocketTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcSubscriptionsTransport({ url: genericUrl }) satisfies IRpcWebSocketTransportMainnet;

// Devnet cluster should be `IRpcWebSocketTransportDevnet`
createDefaultRpcSubscriptionsTransport({ url: devnetUrl }) satisfies IRpcWebSocketTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcSubscriptionsTransport({ url: devnetUrl }) satisfies IRpcWebSocketTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcSubscriptionsTransport({ url: devnetUrl }) satisfies IRpcWebSocketTransportMainnet;

// Testnet cluster should be `IRpcWebSocketTransportTestnet`
createDefaultRpcSubscriptionsTransport({ url: testnetUrl }) satisfies IRpcWebSocketTransportTestnet;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcSubscriptionsTransport({ url: testnetUrl }) satisfies IRpcWebSocketTransportDevnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcSubscriptionsTransport({ url: testnetUrl }) satisfies IRpcWebSocketTransportMainnet;

// Mainnet cluster should be `IRpcWebSocketTransportMainnet`
createDefaultRpcSubscriptionsTransport({ url: mainnetUrl }) satisfies IRpcWebSocketTransportMainnet;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcSubscriptionsTransport({ url: mainnetUrl }) satisfies IRpcWebSocketTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcSubscriptionsTransport({ url: mainnetUrl }) satisfies IRpcWebSocketTransportTestnet;

// Creating JSON Subscription RPC clients

const genericWebSocketTransport = createWebSocketTransport({
    sendBufferHighWatermark: 0,
    url: genericUrl,
});
const devnetWebSocketTransport = createWebSocketTransport({
    sendBufferHighWatermark: 0,
    url: devnetUrl,
});
const testnetWebSocketTransport = createWebSocketTransport({
    sendBufferHighWatermark: 0,
    url: testnetUrl,
});
const mainnetWebSocketTransport = createWebSocketTransport({
    sendBufferHighWatermark: 0,
    url: mainnetUrl,
});

// Checking stable vs unstable subscriptions

createSolanaRpcSubscriptions({
    transport: genericWebSocketTransport,
}) satisfies RpcSubscriptions<SolanaRpcSubscriptions>;
// @ts-expect-error Should not have unstable subscriptions
createSolanaRpcSubscriptions(config) satisfies RpcSubscriptions<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;

createSolanaRpcSubscriptions_UNSTABLE({ transport: genericWebSocketTransport }) satisfies RpcSubscriptions<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;

// Checking cluster-level subscriptions API

// No cluster specified should be generic `RpcSubscriptions`
createSolanaRpcSubscriptions({
    transport: genericWebSocketTransport,
}) satisfies RpcSubscriptions<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: genericWebSocketTransport,
    //@ts-expect-error Should not be a devnet RPC
}) satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: genericWebSocketTransport,
    //@ts-expect-error Should not be a testnet RPC
}) satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: genericWebSocketTransport,
    //@ts-expect-error Should not be a mainnet RPC
}) satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptions>;

// Devnet cluster should be `RpcSubscriptionsDevnet`
createSolanaRpcSubscriptions({
    transport: devnetWebSocketTransport,
}) satisfies RpcSubscriptions<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: devnetWebSocketTransport,
}) satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: devnetWebSocketTransport,
    //@ts-expect-error Should not be a testnet RPC
}) satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: devnetWebSocketTransport,
    //@ts-expect-error Should not be a mainnet RPC
}) satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptions>;
//@ts-expect-error Should not have unstable subscriptions
createSolanaRpcSubscriptions({ transport: devnetWebSocketTransport }) satisfies RpcSubscriptionsDevnet<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;
// Unstable methods present with proper initializer
createSolanaRpcSubscriptions_UNSTABLE({ transport: devnetWebSocketTransport }) satisfies RpcSubscriptionsDevnet<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;

// Testnet cluster should be `RpcSubscriptionsTestnet`
createSolanaRpcSubscriptions({
    transport: testnetWebSocketTransport,
}) satisfies RpcSubscriptions<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: testnetWebSocketTransport,
}) satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: testnetWebSocketTransport,
    //@ts-expect-error Should not be a devnet RPC
}) satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: testnetWebSocketTransport,
    //@ts-expect-error Should not be a mainnet RPC
}) satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptions>;
//@ts-expect-error Should not have unstable subscriptions
createSolanaRpcSubscriptions({ transport: testnetWebSocketTransport }) satisfies RpcSubscriptionsTestnet<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;
// Unstable methods present with proper initializer
createSolanaRpcSubscriptions_UNSTABLE({ transport: testnetWebSocketTransport }) satisfies RpcSubscriptionsTestnet<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;

// Mainnet cluster should be `RpcSubscriptionsMainnet`
createSolanaRpcSubscriptions({
    transport: mainnetWebSocketTransport,
}) satisfies RpcSubscriptions<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: mainnetWebSocketTransport,
}) satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: mainnetWebSocketTransport,
    //@ts-expect-error Should not be a devnet RPC
}) satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptions>;
createSolanaRpcSubscriptions({
    transport: mainnetWebSocketTransport,
    //@ts-expect-error Should not be a testnet RPC
}) satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptions>;
//@ts-expect-error Should not have unstable subscriptions
createSolanaRpcSubscriptions({ transport: mainnetWebSocketTransport }) satisfies RpcSubscriptionsMainnet<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;
// Unstable methods present with proper initializer
createSolanaRpcSubscriptions_UNSTABLE({ transport: mainnetWebSocketTransport }) satisfies RpcSubscriptionsMainnet<
    SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable
>;

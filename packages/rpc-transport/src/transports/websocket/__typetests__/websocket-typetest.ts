import { devnet, mainnet, testnet } from '@solana/rpc-types';

import {
    IRpcWebSocketTransport,
    IRpcWebSocketTransportDevnet,
    IRpcWebSocketTransportMainnet,
    IRpcWebSocketTransportTestnet,
} from '../../transport-types';
import { createWebSocketTransport } from '../websocket-transport';

const genericConfig = { sendBufferHighWatermark: 0, url: 'http://localhost:8899' };
const devnetConfig = { sendBufferHighWatermark: 0, url: devnet('https://api.devnet.solana.com') };
const testnetConfig = { sendBufferHighWatermark: 0, url: testnet('https://api.testnet.solana.com') };
const mainnetConfig = { sendBufferHighWatermark: 0, url: mainnet('https://api.mainnet-beta.solana.com') };

// When providing a generic URL, the transport should be typed as an IRpcWebSocketTransport
createWebSocketTransport(genericConfig) satisfies IRpcWebSocketTransport;
//@ts-expect-error Should not be a devnet transport
createWebSocketTransport(genericConfig) satisfies IRpcWebSocketTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createWebSocketTransport(genericConfig) satisfies IRpcWebSocketTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createWebSocketTransport(genericConfig) satisfies IRpcWebSocketTransportMainnet;

// When providing a devnet URL, the transport should be typed as an IRpcWebSocketTransportDevnet
createWebSocketTransport(devnetConfig) satisfies IRpcWebSocketTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createWebSocketTransport(devnetConfig) satisfies IRpcWebSocketTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createWebSocketTransport(devnetConfig) satisfies IRpcWebSocketTransportMainnet;

// When providing a testnet URL, the transport should be typed as an IRpcWebSocketTransportTestnet
createWebSocketTransport(testnetConfig) satisfies IRpcWebSocketTransportTestnet;
//@ts-expect-error Should not be a devnet transport
createWebSocketTransport(testnetConfig) satisfies IRpcWebSocketTransportDevnet;
//@ts-expect-error Should not be a mainnet transport
createWebSocketTransport(testnetConfig) satisfies IRpcWebSocketTransportMainnet;

// When providing a mainnet URL, the transport should be typed as an IRpcWebSocketTransportMainnet
createWebSocketTransport(mainnetConfig) satisfies IRpcWebSocketTransportMainnet;
//@ts-expect-error Should not be a devnet transport
createWebSocketTransport(mainnetConfig) satisfies IRpcWebSocketTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createWebSocketTransport(mainnetConfig) satisfies IRpcWebSocketTransportTestnet;

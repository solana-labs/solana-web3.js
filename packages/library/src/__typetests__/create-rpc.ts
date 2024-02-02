import {
    RequestAirdropApi,
    SolanaRpcMethods,
    SolanaRpcMethodsDevnet,
    SolanaRpcMethodsMainnet,
    SolanaRpcMethodsTestnet,
} from '@solana/rpc-core';
import {
    createHttpTransport,
    type IRpcTransport,
    type IRpcTransportDevnet,
    type IRpcTransportMainnet,
    type IRpcTransportTestnet,
    type RpcDevnet,
    type RpcMainnet,
    type RpcTestnet,
} from '@solana/rpc-transport';
import { devnet, mainnet, type Rpc, testnet } from '@solana/rpc-types';

import { createSolanaRpc } from '../rpc';
import { createDefaultRpcTransport } from '../rpc-transport';

// Creating default HTTP transports

const genericUrl = 'http://localhost:8899';
const devnetUrl = devnet('https://api.devnet.solana.com');
const testnetUrl = testnet('https://api.testnet.solana.com');
const mainnetUrl = mainnet('https://api.mainnet-beta.solana.com');

// No cluster specified should be generic `IRpcTransport`
createDefaultRpcTransport({ url: genericUrl }) satisfies IRpcTransport;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcTransport({ url: genericUrl }) satisfies IRpcTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcTransport({ url: genericUrl }) satisfies IRpcTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcTransport({ url: genericUrl }) satisfies IRpcTransportMainnet;

// Devnet cluster should be `IRpcTransportDevnet`
createDefaultRpcTransport({ url: devnetUrl }) satisfies IRpcTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcTransport({ url: devnetUrl }) satisfies IRpcTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcTransport({ url: devnetUrl }) satisfies IRpcTransportMainnet;

// Testnet cluster should be `IRpcTransportTestnet`
createDefaultRpcTransport({ url: testnetUrl }) satisfies IRpcTransportTestnet;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcTransport({ url: testnetUrl }) satisfies IRpcTransportDevnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcTransport({ url: testnetUrl }) satisfies IRpcTransportMainnet;

// Mainnet cluster should be `IRpcTransportMainnet`
createDefaultRpcTransport({ url: mainnetUrl }) satisfies IRpcTransportMainnet;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcTransport({ url: mainnetUrl }) satisfies IRpcTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcTransport({ url: mainnetUrl }) satisfies IRpcTransportTestnet;

// Creating JSON RPC clients

const genericTransport = createHttpTransport({ url: genericUrl });
const devnetTransport = createHttpTransport({ url: devnetUrl });
const testnetTransport = createHttpTransport({ url: testnetUrl });
const mainnetTransport = createHttpTransport({ url: mainnetUrl });

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

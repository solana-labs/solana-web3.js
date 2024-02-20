import type { SolanaRpcApi, SolanaRpcApiDevnet, SolanaRpcApiMainnet, SolanaRpcApiTestnet } from '@solana/rpc-api';
import type { Rpc, RpcTransport } from '@solana/rpc-spec';
import { devnet, mainnet, testnet } from '@solana/rpc-types';

import { createSolanaRpc } from '../rpc';
import type {
    RpcDevnet,
    RpcMainnet,
    RpcTestnet,
    RpcTransportDevnet,
    RpcTransportMainnet,
    RpcTransportTestnet,
} from '../rpc-clusters';
import { createDefaultRpcTransport } from '../rpc-transport';

// Creating default HTTP transports

const genericUrl = 'http://localhost:8899';
const devnetUrl = devnet('https://api.devnet.solana.com');
const testnetUrl = testnet('https://api.testnet.solana.com');
const mainnetUrl = mainnet('https://api.mainnet-beta.solana.com');

// No cluster specified should be generic `RpcTransport`
createDefaultRpcTransport({ url: genericUrl }) satisfies RpcTransport;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcTransport({ url: genericUrl }) satisfies RpcTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcTransport({ url: genericUrl }) satisfies RpcTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcTransport({ url: genericUrl }) satisfies RpcTransportMainnet;

// Devnet cluster should be `RpcTransportDevnet`
createDefaultRpcTransport({ url: devnetUrl }) satisfies RpcTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcTransport({ url: devnetUrl }) satisfies RpcTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcTransport({ url: devnetUrl }) satisfies RpcTransportMainnet;

// Testnet cluster should be `RpcTransportTestnet`
createDefaultRpcTransport({ url: testnetUrl }) satisfies RpcTransportTestnet;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcTransport({ url: testnetUrl }) satisfies RpcTransportDevnet;
//@ts-expect-error Should not be a mainnet transport
createDefaultRpcTransport({ url: testnetUrl }) satisfies RpcTransportMainnet;

// Mainnet cluster should be `RpcTransportMainnet`
createDefaultRpcTransport({ url: mainnetUrl }) satisfies RpcTransportMainnet;
//@ts-expect-error Should not be a devnet transport
createDefaultRpcTransport({ url: mainnetUrl }) satisfies RpcTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createDefaultRpcTransport({ url: mainnetUrl }) satisfies RpcTransportTestnet;

// Creating JSON RPC clients

const genericTransport = createDefaultRpcTransport({ url: genericUrl });
const devnetTransport = createDefaultRpcTransport({ url: devnetUrl });
const testnetTransport = createDefaultRpcTransport({ url: testnetUrl });
const mainnetTransport = createDefaultRpcTransport({ url: mainnetUrl });

// No cluster specified should be generic `Rpc`
createSolanaRpc({ transport: genericTransport }) satisfies Rpc<SolanaRpcApi>;
//@ts-expect-error Should not be a devnet RPC
createSolanaRpc({ transport: genericTransport }) satisfies RpcDevnet<SolanaRpcApi>;
//@ts-expect-error Should not be a testnet RPC
createSolanaRpc({ transport: genericTransport }) satisfies RpcTestnet<SolanaRpcApi>;
//@ts-expect-error Should not be a mainnet RPC
createSolanaRpc({ transport: genericTransport }) satisfies RpcMainnet<SolanaRpcApi>;

// Devnet cluster should be `RpcDevnet`
createSolanaRpc({ transport: devnetTransport }) satisfies Rpc<SolanaRpcApi>;
createSolanaRpc({ transport: devnetTransport }) satisfies Rpc<SolanaRpcApiDevnet>;
createSolanaRpc({ transport: devnetTransport }) satisfies RpcDevnet<SolanaRpcApi>;
createSolanaRpc({ transport: devnetTransport }) satisfies RpcDevnet<SolanaRpcApiDevnet>; // Same types
//@ts-expect-error Should not be a testnet RPC
createSolanaRpc({ transport: devnetTransport }) satisfies RpcTestnet<SolanaRpcApi>;
//@ts-expect-error Should not be a mainnet RPC
createSolanaRpc({ transport: devnetTransport }) satisfies RpcMainnet<SolanaRpcApi>;

// Testnet cluster should be `RpcTestnet`
createSolanaRpc({ transport: testnetTransport }) satisfies Rpc<SolanaRpcApi>;
createSolanaRpc({ transport: testnetTransport }) satisfies Rpc<SolanaRpcApiTestnet>;
createSolanaRpc({ transport: testnetTransport }) satisfies RpcTestnet<SolanaRpcApi>;
createSolanaRpc({ transport: testnetTransport }) satisfies RpcTestnet<SolanaRpcApiTestnet>; // Same types
//@ts-expect-error Should not be a devnet RPC
createSolanaRpc({ transport: testnetTransport }) satisfies RpcDevnet<SolanaRpcApi>;
//@ts-expect-error Should not be a mainnet RPC
createSolanaRpc({ transport: testnetTransport }) satisfies RpcMainnet<SolanaRpcApi>;

// Mainnet cluster should be `RpcMainnet`
createSolanaRpc({ transport: mainnetTransport }) satisfies Rpc<SolanaRpcApiMainnet>;
//@ts-expect-error Should not have `requestAirdrop` method
createSolanaRpc({ transport: mainnetTransport }) satisfies Rpc<SolanaRpcApi>;
//@ts-expect-error Should not have `requestAirdrop` method
createSolanaRpc({ transport: mainnetTransport }) satisfies Rpc<RequestAirdropApi>;
//@ts-expect-error Should not be a devnet RPC
createSolanaRpc({ transport: mainnetTransport }) satisfies RpcDevnet<SolanaRpcApi>;
//@ts-expect-error Should not be a testnet RPC
createSolanaRpc({ transport: mainnetTransport }) satisfies RpcTestnet<SolanaRpcApi>;

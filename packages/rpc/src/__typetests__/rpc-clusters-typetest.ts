import type { SolanaRpcApi, SolanaRpcApiDevnet, SolanaRpcApiMainnet, SolanaRpcApiTestnet } from '@solana/rpc-api';
import type { Rpc, RpcTransport } from '@solana/rpc-spec';
import { devnet, mainnet, testnet } from '@solana/rpc-types';

import { createSolanaRpc, createSolanaRpcFromTransport } from '../rpc';
import type {
    RpcDevnet,
    RpcMainnet,
    RpcTestnet,
    RpcTransportDevnet,
    RpcTransportMainnet,
    RpcTransportTestnet,
} from '../rpc-clusters';
import { createDefaultRpcTransport } from '../rpc-transport';

// Define cluster-aware URLs and transports.

const genericUrl = 'http://localhost:8899';
const devnetUrl = devnet('https://api.devnet.solana.com');
const testnetUrl = testnet('https://api.testnet.solana.com');
const mainnetUrl = mainnet('https://api.mainnet-beta.solana.com');

const genericTransport = createDefaultRpcTransport({ url: genericUrl });
const devnetTransport = createDefaultRpcTransport({ url: devnetUrl });
const testnetTransport = createDefaultRpcTransport({ url: testnetUrl });
const mainnetTransport = createDefaultRpcTransport({ url: mainnetUrl });

// [DESCRIBE] createDefaultRpcTransport.
{
    // No cluster specified should be generic `RpcTransport`.
    {
        genericTransport satisfies RpcTransport;
        //@ts-expect-error Should not be a devnet transport
        genericTransport satisfies RpcTransportDevnet;
        //@ts-expect-error Should not be a testnet transport
        genericTransport satisfies RpcTransportTestnet;
        //@ts-expect-error Should not be a mainnet transport
        genericTransport satisfies RpcTransportMainnet;
    }

    // Devnet cluster should be `RpcTransportDevnet`.
    {
        devnetTransport satisfies RpcTransportDevnet;
        //@ts-expect-error Should not be a testnet transport
        devnetTransport satisfies RpcTransportTestnet;
        //@ts-expect-error Should not be a mainnet transport
        devnetTransport satisfies RpcTransportMainnet;
    }

    // Testnet cluster should be `RpcTransportTestnet`.
    {
        testnetTransport satisfies RpcTransportTestnet;
        //@ts-expect-error Should not be a devnet transport
        testnetTransport satisfies RpcTransportDevnet;
        //@ts-expect-error Should not be a mainnet transport
        testnetTransport satisfies RpcTransportMainnet;
    }

    // Mainnet cluster should be `RpcTransportMainnet`.
    {
        mainnetTransport satisfies RpcTransportMainnet;
        //@ts-expect-error Should not be a devnet transport
        mainnetTransport satisfies RpcTransportDevnet;
        //@ts-expect-error Should not be a testnet transport
        mainnetTransport satisfies RpcTransportTestnet;
    }
}

// [DESCRIBE] createSolanaRpcFromTransport.
{
    const genericRpc = createSolanaRpcFromTransport(genericTransport);
    const devnetRpc = createSolanaRpcFromTransport(devnetTransport);
    const testnetRpc = createSolanaRpcFromTransport(testnetTransport);
    const mainnetRpc = createSolanaRpcFromTransport(mainnetTransport);

    // No cluster specified should be generic `Rpc`.
    {
        genericRpc satisfies Rpc<SolanaRpcApi>;
        //@ts-expect-error Should not be a devnet RPC
        genericRpc satisfies RpcDevnet<SolanaRpcApi>;
        //@ts-expect-error Should not be a testnet RPC
        genericRpc satisfies RpcTestnet<SolanaRpcApi>;
        //@ts-expect-error Should not be a mainnet RPC
        genericRpc satisfies RpcMainnet<SolanaRpcApi>;
    }

    // Devnet cluster should be `RpcDevnet`.
    {
        devnetRpc satisfies Rpc<SolanaRpcApi>;
        devnetRpc satisfies Rpc<SolanaRpcApiDevnet>;
        devnetRpc satisfies RpcDevnet<SolanaRpcApi>;
        devnetRpc satisfies RpcDevnet<SolanaRpcApiDevnet>; // Same types
        //@ts-expect-error Should not be a testnet RPC
        devnetRpc satisfies RpcTestnet<SolanaRpcApi>;
        //@ts-expect-error Should not be a mainnet RPC
        devnetRpc satisfies RpcMainnet<SolanaRpcApi>;
    }

    // Testnet cluster should be `RpcTestnet`.
    {
        testnetRpc satisfies Rpc<SolanaRpcApi>;
        testnetRpc satisfies Rpc<SolanaRpcApiTestnet>;
        testnetRpc satisfies RpcTestnet<SolanaRpcApi>;
        testnetRpc satisfies RpcTestnet<SolanaRpcApiTestnet>; // Same types
        //@ts-expect-error Should not be a devnet RPC
        testnetRpc satisfies RpcDevnet<SolanaRpcApi>;
        //@ts-expect-error Should not be a mainnet RPC
        testnetRpc satisfies RpcMainnet<SolanaRpcApi>;
    }

    // Mainnet cluster should be `RpcMainnet`.
    {
        mainnetRpc satisfies Rpc<SolanaRpcApiMainnet>;
        mainnetRpc satisfies RpcMainnet<SolanaRpcApiMainnet>;
        //@ts-expect-error Should not have `requestAirdrop` method
        mainnetRpc satisfies Rpc<RequestAirdropApi>;
        //@ts-expect-error Should not be a devnet RPC
        mainnetRpc satisfies RpcDevnet<SolanaRpcApi>;
        //@ts-expect-error Should not be a testnet RPC
        mainnetRpc satisfies RpcTestnet<SolanaRpcApi>;
    }
}

// [DESCRIBE] createSolanaRpc.
{
    const genericRpc = createSolanaRpc(genericUrl);
    const devnetRpc = createSolanaRpc(devnetUrl);
    const testnetRpc = createSolanaRpc(testnetUrl);
    const mainnetRpc = createSolanaRpc(mainnetUrl);

    // No cluster specified should be generic `Rpc`.
    {
        genericRpc satisfies Rpc<SolanaRpcApi>;
        //@ts-expect-error Should not be a devnet RPC
        genericRpc satisfies RpcDevnet<SolanaRpcApi>;
        //@ts-expect-error Should not be a testnet RPC
        genericRpc satisfies RpcTestnet<SolanaRpcApi>;
        //@ts-expect-error Should not be a mainnet RPC
        genericRpc satisfies RpcMainnet<SolanaRpcApi>;
    }

    // Devnet cluster should be `RpcDevnet`.
    {
        devnetRpc satisfies Rpc<SolanaRpcApi>;
        devnetRpc satisfies Rpc<SolanaRpcApiDevnet>;
        devnetRpc satisfies RpcDevnet<SolanaRpcApi>;
        devnetRpc satisfies RpcDevnet<SolanaRpcApiDevnet>; // Same types
        //@ts-expect-error Should not be a testnet RPC
        devnetRpc satisfies RpcTestnet<SolanaRpcApi>;
        //@ts-expect-error Should not be a mainnet RPC
        devnetRpc satisfies RpcMainnet<SolanaRpcApi>;
    }

    // Testnet cluster should be `RpcTestnet`.
    {
        testnetRpc satisfies Rpc<SolanaRpcApi>;
        testnetRpc satisfies Rpc<SolanaRpcApiTestnet>;
        testnetRpc satisfies RpcTestnet<SolanaRpcApi>;
        testnetRpc satisfies RpcTestnet<SolanaRpcApiTestnet>; // Same types
        //@ts-expect-error Should not be a devnet RPC
        testnetRpc satisfies RpcDevnet<SolanaRpcApi>;
        //@ts-expect-error Should not be a mainnet RPC
        testnetRpc satisfies RpcMainnet<SolanaRpcApi>;
    }

    // Mainnet cluster should be `RpcMainnet`.
    {
        mainnetRpc satisfies Rpc<SolanaRpcApiMainnet>;
        mainnetRpc satisfies RpcMainnet<SolanaRpcApiMainnet>;
        //@ts-expect-error Should not have `requestAirdrop` method
        mainnetRpc satisfies Rpc<RequestAirdropApi>;
        //@ts-expect-error Should not be a devnet RPC
        mainnetRpc satisfies RpcDevnet<SolanaRpcApi>;
        //@ts-expect-error Should not be a testnet RPC
        mainnetRpc satisfies RpcTestnet<SolanaRpcApi>;
    }
}

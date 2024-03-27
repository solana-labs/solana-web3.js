import type { SolanaRpcSubscriptionsApi, SolanaRpcSubscriptionsApiUnstable } from '@solana/rpc-subscriptions-api';
import type { RpcSubscriptions, RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';
import { devnet, mainnet, testnet } from '@solana/rpc-types';

import {
    createSolanaRpcSubscriptions,
    createSolanaRpcSubscriptions_UNSTABLE,
    createSolanaRpcSubscriptionsFromTransport,
    createSolanaRpcSubscriptionsFromTransport_UNSTABLE,
} from '../rpc-subscriptions';
import type {
    RpcSubscriptionsDevnet,
    RpcSubscriptionsMainnet,
    RpcSubscriptionsTestnet,
    RpcSubscriptionsTransportDevnet,
    RpcSubscriptionsTransportMainnet,
    RpcSubscriptionsTransportTestnet,
} from '../rpc-subscriptions-clusters';
import { createDefaultRpcSubscriptionsTransport } from '../rpc-subscriptions-transport';

// Define cluster-aware URLs and transports.

const genericUrl = 'http://localhost:8899';
const devnetUrl = devnet('https://api.devnet.solana.com');
const testnetUrl = testnet('https://api.testnet.solana.com');
const mainnetUrl = mainnet('https://api.mainnet-beta.solana.com');

const genericTransport = createDefaultRpcSubscriptionsTransport({ url: genericUrl });
const devnetTransport = createDefaultRpcSubscriptionsTransport({ url: devnetUrl });
const testnetTransport = createDefaultRpcSubscriptionsTransport({ url: testnetUrl });
const mainnetTransport = createDefaultRpcSubscriptionsTransport({ url: mainnetUrl });

// [DESCRIBE] createDefaultRpcSubscriptionsTransport.
{
    // No cluster specified should be generic `RpcSubscriptionsTransport`.
    {
        genericTransport satisfies RpcSubscriptionsTransport;
        //@ts-expect-error Should not be a devnet transport
        genericTransport satisfies RpcSubscriptionsTransportDevnet;
        //@ts-expect-error Should not be a testnet transport
        genericTransport satisfies RpcSubscriptionsTransportTestnet;
        //@ts-expect-error Should not be a mainnet transport
        genericTransport satisfies RpcSubscriptionsTransportMainnet;
    }

    // Devnet cluster should be `RpcSubscriptionsTransportDevnet`.
    {
        devnetTransport satisfies RpcSubscriptionsTransportDevnet;
        //@ts-expect-error Should not be a testnet transport
        devnetTransport satisfies RpcSubscriptionsTransportTestnet;
        //@ts-expect-error Should not be a mainnet transport
        devnetTransport satisfies RpcSubscriptionsTransportMainnet;
    }

    // Testnet cluster should be `RpcSubscriptionsTransportTestnet`.
    {
        testnetTransport satisfies RpcSubscriptionsTransportTestnet;
        //@ts-expect-error Should not be a devnet transport
        testnetTransport satisfies RpcSubscriptionsTransportDevnet;
        //@ts-expect-error Should not be a mainnet transport
        testnetTransport satisfies RpcSubscriptionsTransportMainnet;
    }

    // Mainnet cluster should be `RpcSubscriptionsTransportMainnet`.
    {
        mainnetTransport satisfies RpcSubscriptionsTransportMainnet;
        //@ts-expect-error Should not be a devnet transport
        mainnetTransport satisfies RpcSubscriptionsTransportDevnet;
        //@ts-expect-error Should not be a testnet transport
        mainnetTransport satisfies RpcSubscriptionsTransportTestnet;
    }
}

// [DESCRIBE] createSolanaRpcSubscriptionsFromTransport.
{
    const genericRpc = createSolanaRpcSubscriptionsFromTransport(genericTransport);
    const devnetRpc = createSolanaRpcSubscriptionsFromTransport(devnetTransport);
    const tesnetRpc = createSolanaRpcSubscriptionsFromTransport(testnetTransport);
    const mainnetRpc = createSolanaRpcSubscriptionsFromTransport(mainnetTransport);

    // Checking stable subscriptions.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        tesnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;

        // @ts-expect-error Should not have unstable subscriptions
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        tesnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
    }

    // No cluster specified should be generic `RpcSubscriptions`.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a devnet RPC
        genericRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a testnet RPC
        genericRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a mainnet RPC
        genericRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Devnet cluster should be `RpcSubscriptionsDevnet`.
    {
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        devnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a testnet RPC
        devnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a mainnet RPC
        devnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Testnet cluster should be `RpcSubscriptionsTestnet`.
    {
        tesnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        tesnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a devnet RPC
        tesnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a mainnet RPC
        tesnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Mainnet cluster should be `RpcSubscriptionsMainnet`.
    {
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        mainnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a devnet RPC
        mainnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a testnet RPC
        mainnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
    }
}

// [DESCRIBE] createSolanaRpcSubscriptionsFromTransport_UNSTABLE.
{
    const genericRpc = createSolanaRpcSubscriptionsFromTransport_UNSTABLE(genericTransport);
    const devnetRpc = createSolanaRpcSubscriptionsFromTransport_UNSTABLE(devnetTransport);
    const tesnetRpc = createSolanaRpcSubscriptionsFromTransport_UNSTABLE(testnetTransport);
    const mainnetRpc = createSolanaRpcSubscriptionsFromTransport_UNSTABLE(mainnetTransport);

    // Checking unstable subscriptions.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        devnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        tesnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        mainnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
    }
}

// [DESCRIBE] createSolanaRpcSubscriptions.
{
    const genericRpc = createSolanaRpcSubscriptions(genericUrl);
    const devnetRpc = createSolanaRpcSubscriptions(devnetUrl);
    const tesnetRpc = createSolanaRpcSubscriptions(testnetUrl);
    const mainnetRpc = createSolanaRpcSubscriptions(mainnetUrl);

    // Checking stable subscriptions.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        tesnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;

        // @ts-expect-error Should not have unstable subscriptions
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        tesnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
    }

    // No cluster specified should be generic `RpcSubscriptions`.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a devnet RPC
        genericRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a testnet RPC
        genericRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a mainnet RPC
        genericRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Devnet cluster should be `RpcSubscriptionsDevnet`.
    {
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        devnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a testnet RPC
        devnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a mainnet RPC
        devnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Testnet cluster should be `RpcSubscriptionsTestnet`.
    {
        tesnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        tesnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a devnet RPC
        tesnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a mainnet RPC
        tesnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Mainnet cluster should be `RpcSubscriptionsMainnet`.
    {
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        mainnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a devnet RPC
        mainnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        //@ts-expect-error Should not be a testnet RPC
        mainnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
    }
}

// [DESCRIBE] createSolanaRpcSubscriptions_UNSTABLE.
{
    const genericRpc = createSolanaRpcSubscriptions_UNSTABLE(genericUrl);
    const devnetRpc = createSolanaRpcSubscriptions_UNSTABLE(devnetUrl);
    const tesnetRpc = createSolanaRpcSubscriptions_UNSTABLE(testnetUrl);
    const mainnetRpc = createSolanaRpcSubscriptions_UNSTABLE(mainnetUrl);

    // Checking unstable subscriptions.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        devnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        tesnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        mainnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
    }
}

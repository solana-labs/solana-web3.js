import type { SolanaRpcSubscriptionsApi, SolanaRpcSubscriptionsApiUnstable } from '@solana/rpc-subscriptions-api';
import type {
    RpcSubscriptions,
    RpcSubscriptionsChannelCreator,
    RpcSubscriptionsTransport,
} from '@solana/rpc-subscriptions-spec';
import { devnet, mainnet, testnet } from '@solana/rpc-types';

import {
    createSolanaRpcSubscriptions,
    createSolanaRpcSubscriptions_UNSTABLE,
    createSolanaRpcSubscriptionsFromTransport,
} from '../rpc-subscriptions';
import { createDefaultRpcSubscriptionsChannelCreator } from '../rpc-subscriptions-channel';
import type {
    RpcSubscriptionsChannelCreatorDevnet,
    RpcSubscriptionsChannelCreatorMainnet,
    RpcSubscriptionsChannelCreatorTestnet,
    RpcSubscriptionsDevnet,
    RpcSubscriptionsMainnet,
    RpcSubscriptionsTestnet,
    RpcSubscriptionsTransportDevnet,
    RpcSubscriptionsTransportMainnet,
    RpcSubscriptionsTransportTestnet,
} from '../rpc-subscriptions-clusters';
import { createRpcSubscriptionsTransportFromChannelCreator } from '../rpc-subscriptions-transport';

// Define cluster-aware URLs and transports.

const genericUrl = 'http://localhost:8899';
const devnetUrl = devnet('https://api.devnet.solana.com');
const testnetUrl = testnet('https://api.testnet.solana.com');
const mainnetUrl = mainnet('https://api.mainnet-beta.solana.com');

// [DESCRIBE] createDefaultRpcSubscriptionsChannelCreator.
{
    const genericChannelCreator = createDefaultRpcSubscriptionsChannelCreator({ url: genericUrl });
    const devnetChannelCreator = createDefaultRpcSubscriptionsChannelCreator({ url: devnetUrl });
    const testnetChannelCreator = createDefaultRpcSubscriptionsChannelCreator({ url: testnetUrl });
    const mainnetChannelCreator = createDefaultRpcSubscriptionsChannelCreator({ url: mainnetUrl });

    // When no cluster is specified, it should be a generic `RpcSubscriptionsChannel`.
    {
        genericChannelCreator satisfies RpcSubscriptionsChannelCreator<unknown, unknown>;
        // @ts-expect-error Should not be a testnet channel
        genericChannelCreator satisfies RpcSubscriptionsChannelCreatorDevnet<unknown, unknown>;
        // @ts-expect-error Should not be a testnet channel
        genericChannelCreator satisfies RpcSubscriptionsChannelCreatorTestnet<unknown, unknown>;
        // @ts-expect-error Should not be a mainnet channel
        genericChannelCreator satisfies RpcSubscriptionsChannelCreatorMainnet<unknown, unknown>;
    }

    // Devnet cluster should be `RpcSubscriptionsChannelCreatorDevnet`.
    {
        devnetChannelCreator satisfies RpcSubscriptionsChannelCreatorDevnet<unknown, unknown>;
        // @ts-expect-error Should not be a testnet channel
        devnetChannelCreator satisfies RpcSubscriptionsChannelCreatorTestnet<unknown, unknown>;
        // @ts-expect-error Should not be a mainnet channel
        devnetChannelCreator satisfies RpcSubscriptionsChannelCreatorMainnet<unknown, unknown>;
    }

    // Testnet cluster should be `RpcSubscriptionsChannelCreatorTestnet`.
    {
        testnetChannelCreator satisfies RpcSubscriptionsChannelCreatorTestnet<unknown, unknown>;
        // @ts-expect-error Should not be a devnet channel
        testnetChannelCreator satisfies RpcSubscriptionsChannelCreatorDevnet<unknown, unknown>;
        // @ts-expect-error Should not be a mainnet channel
        testnetChannelCreator satisfies RpcSubscriptionsChannelCreatorMainnet<unknown, unknown>;
    }

    // Mainnet cluster should be `RpcSubscriptionsChannelCreatorMainnet`.
    {
        mainnetChannelCreator satisfies RpcSubscriptionsChannelCreatorMainnet<unknown, unknown>;
        // @ts-expect-error Should not be a devnet channel
        mainnetChannelCreator satisfies RpcSubscriptionsChannelCreatorDevnet<unknown, unknown>;
        // @ts-expect-error Should not be a testnet channel
        mainnetChannelCreator satisfies RpcSubscriptionsChannelCreatorTestnet<unknown, unknown>;
    }
}

// [DESCRIBE] createRpcSubscriptionsTransportFromChannelCreator.
{
    const genericTransport = createRpcSubscriptionsTransportFromChannelCreator(
        null as unknown as RpcSubscriptionsChannelCreator<unknown, unknown>,
    );
    const devnetTransport = createRpcSubscriptionsTransportFromChannelCreator(
        null as unknown as RpcSubscriptionsChannelCreatorDevnet<unknown, unknown>,
    );
    const testnetTransport = createRpcSubscriptionsTransportFromChannelCreator(
        null as unknown as RpcSubscriptionsChannelCreatorTestnet<unknown, unknown>,
    );
    const mainnetTransport = createRpcSubscriptionsTransportFromChannelCreator(
        null as unknown as RpcSubscriptionsChannelCreatorMainnet<unknown, unknown>,
    );

    // When no cluster is specified, it should be a generic `RpcSubscriptionsTransport{
    {
        genericTransport satisfies RpcSubscriptionsTransport;
        // @ts-expect-error Should not be a testnet channel
        genericTransport satisfies RpcSubscriptionsTransportDevnet;
        // @ts-expect-error Should not be a testnet channel
        genericTransport satisfies RpcSubscriptionsTransportTestnet;
        // @ts-expect-error Should not be a mainnet channel
        genericTransport satisfies RpcSubscriptionsTransportMainnet;
    }

    // Devnet cluster should be `RpcSubscriptionsTransportDevnet`.
    {
        devnetTransport satisfies RpcSubscriptionsTransportDevnet;
        // @ts-expect-error Should not be a testnet channel
        devnetTransport satisfies RpcSubscriptionsTransportTestnet;
        // @ts-expect-error Should not be a mainnet channel
        devnetTransport satisfies RpcSubscriptionsTransportMainnet;
    }

    // Testnet cluster should be `RpcSubscriptionsTransportTestnet`.
    {
        testnetTransport satisfies RpcSubscriptionsTransportTestnet;
        // @ts-expect-error Should not be a devnet channel
        testnetTransport satisfies RpcSubscriptionsTransportDevnet;
        // @ts-expect-error Should not be a mainnet channel
        testnetTransport satisfies RpcSubscriptionsTransportMainnet;
    }

    // Mainnet cluster should be `RpcSubscriptionsTransportMainnet`.
    {
        mainnetTransport satisfies RpcSubscriptionsTransportMainnet;
        // @ts-expect-error Should not be a devnet channel
        mainnetTransport satisfies RpcSubscriptionsTransportDevnet;
        // @ts-expect-error Should not be a testnet channel
        mainnetTransport satisfies RpcSubscriptionsTransportTestnet;
    }
}

// [DESCRIBE] createSolanaRpcSubscriptionsFromTransport.
{
    const genericRpc = createSolanaRpcSubscriptionsFromTransport(null as unknown as RpcSubscriptionsTransport);
    const devnetRpc = createSolanaRpcSubscriptionsFromTransport(null as unknown as RpcSubscriptionsTransportDevnet);
    const testnetRpc = createSolanaRpcSubscriptionsFromTransport(null as unknown as RpcSubscriptionsTransportTestnet);
    const mainnetRpc = createSolanaRpcSubscriptionsFromTransport(null as unknown as RpcSubscriptionsTransportMainnet);

    // Checking stable subscriptions.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        testnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;

        // @ts-expect-error Should not have unstable subscriptions
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        testnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
    }

    // When no cluster is specified, it should be a generic `RpcSubscriptions`.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a devnet RPC
        genericRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a testnet RPC
        genericRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a mainnet RPC
        genericRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Devnet cluster should be `RpcSubscriptionsDevnet`.
    {
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        devnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a testnet RPC
        devnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a mainnet RPC
        devnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Testnet cluster should be `RpcSubscriptionsTestnet`.
    {
        testnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        testnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a devnet RPC
        testnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a mainnet RPC
        testnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Mainnet cluster should be `RpcSubscriptionsMainnet`.
    {
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        mainnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a devnet RPC
        mainnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a testnet RPC
        mainnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
    }
}

// [DESCRIBE] createSolanaRpcSubscriptions.
{
    const genericRpc = createSolanaRpcSubscriptions(genericUrl);
    const devnetRpc = createSolanaRpcSubscriptions(devnetUrl);
    const testnetRpc = createSolanaRpcSubscriptions(testnetUrl);
    const mainnetRpc = createSolanaRpcSubscriptions(mainnetUrl);

    // Checking stable subscriptions.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        testnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;

        // @ts-expect-error Should not have unstable subscriptions
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        testnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        // @ts-expect-error Should not have unstable subscriptions
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
    }

    // When no cluster is specified, it should be a generic `RpcSubscriptions`.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a devnet RPC
        genericRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a testnet RPC
        genericRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a mainnet RPC
        genericRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Devnet cluster should be `RpcSubscriptionsDevnet`.
    {
        devnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        devnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a testnet RPC
        devnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a mainnet RPC
        devnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Testnet cluster should be `RpcSubscriptionsTestnet`.
    {
        testnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        testnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a devnet RPC
        testnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a mainnet RPC
        testnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
    }

    // Mainnet cluster should be `RpcSubscriptionsMainnet`.
    {
        mainnetRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi>;
        mainnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a devnet RPC
        mainnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>;
        // @ts-expect-error Should not be a testnet RPC
        mainnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi>;
    }
}

// [DESCRIBE] createSolanaRpcSubscriptions_UNSTABLE.
{
    const genericRpc = createSolanaRpcSubscriptions_UNSTABLE(genericUrl);
    const devnetRpc = createSolanaRpcSubscriptions_UNSTABLE(devnetUrl);
    const testnetRpc = createSolanaRpcSubscriptions_UNSTABLE(testnetUrl);
    const mainnetRpc = createSolanaRpcSubscriptions_UNSTABLE(mainnetUrl);

    // Checking unstable subscriptions.
    {
        genericRpc satisfies RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        devnetRpc satisfies RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        testnetRpc satisfies RpcSubscriptionsTestnet<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
        mainnetRpc satisfies RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>;
    }
}

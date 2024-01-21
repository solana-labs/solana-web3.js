import { devnet, IRpcApiSubscriptions, mainnet, RpcSubscriptions, testnet } from '@solana/rpc-types';

import { createJsonRpcSubscriptionsApi } from '../apis/subscriptions/subscriptions-api';
import { createJsonSubscriptionRpc } from '../json-rpc-subscription';
import { RpcSubscriptionsDevnet, RpcSubscriptionsMainnet, RpcSubscriptionsTestnet } from '../json-rpc-types';
import { createWebSocketTransport } from '../transports/websocket/websocket-transport';

interface MySubscriptionApiMethods extends IRpcApiSubscriptions {
    foo(): number;
    bar(): string;
}

const api = null as unknown as ReturnType<typeof createJsonRpcSubscriptionsApi<MySubscriptionApiMethods>>;

const genericTransport = createWebSocketTransport({ sendBufferHighWatermark: 0, url: 'http://localhost:8899' });
const devnetTransport = createWebSocketTransport({
    sendBufferHighWatermark: 0,
    url: devnet('https://api.devnet.solana.com'),
});
const testnetTransport = createWebSocketTransport({
    sendBufferHighWatermark: 0,
    url: testnet('https://api.testnet.solana.com'),
});
const mainnetTransport = createWebSocketTransport({
    sendBufferHighWatermark: 0,
    url: mainnet('https://api.mainnet-beta.solana.com'),
});

// When providing a generic transport, the RPC should be typed as RpcSubscription
createJsonSubscriptionRpc({ api, transport: genericTransport }) satisfies RpcSubscriptions<MySubscriptionApiMethods>;
createJsonSubscriptionRpc({
    api,
    transport: genericTransport,
    //@ts-expect-error Should not be a devnet transport
}) satisfies RpcSubscriptionsDevnet<MySubscriptionApiMethods>;
createJsonSubscriptionRpc({
    api,
    transport: genericTransport,
    //@ts-expect-error Should not be a testnet transport
}) satisfies RpcSubscriptionsTestnet<MySubscriptionApiMethods>;
createJsonSubscriptionRpc({
    api,
    transport: genericTransport,
    //@ts-expect-error Should not be a mainnet transport
}) satisfies RpcSubscriptionsMainnet<MySubscriptionApiMethods>;

// When providing a devnet transport, the RPC should be typed as RpcSubscriptionsDevnet
createJsonSubscriptionRpc({
    api,
    transport: devnetTransport,
}) satisfies RpcSubscriptionsDevnet<MySubscriptionApiMethods>;
createJsonSubscriptionRpc({
    api,
    transport: devnetTransport,
    //@ts-expect-error Should not be a testnet transport
}) satisfies RpcSubscriptionsTestnet<MySubscriptionApiMethods>;
createJsonSubscriptionRpc({
    api,
    transport: devnetTransport,
    //@ts-expect-error Should not be a mainnet transport
}) satisfies RpcSubscriptionsMainnet<MySubscriptionApiMethods>;

// When providing a testnet transport, the RPC should be typed as RpcSubscriptionsTestnet
createJsonSubscriptionRpc({
    api,
    transport: testnetTransport,
}) satisfies RpcSubscriptionsTestnet<MySubscriptionApiMethods>;
createJsonSubscriptionRpc({
    api,
    transport: testnetTransport,
    //@ts-expect-error Should not be a devnet transport
}) satisfies RpcSubscriptionsDevnet<MySubscriptionApiMethods>;
createJsonSubscriptionRpc({
    api,
    transport: testnetTransport,
    //@ts-expect-error Should not be a mainnet transport
}) satisfies RpcSubscriptionsMainnet<MySubscriptionApiMethods>;

// When providing a mainnet transport, the RPC should be typed as RpcSubscriptionsMainnet
createJsonSubscriptionRpc({
    api,
    transport: mainnetTransport,
}) satisfies RpcSubscriptionsMainnet<MySubscriptionApiMethods>;
createJsonSubscriptionRpc({
    api,
    transport: mainnetTransport,
    //@ts-expect-error Should not be a devnet transport
}) satisfies RpcSubscriptionsDevnet<MySubscriptionApiMethods>;
createJsonSubscriptionRpc({
    api,
    transport: mainnetTransport,
    //@ts-expect-error Should not be a testnet transport
}) satisfies RpcSubscriptionsTestnet<MySubscriptionApiMethods>;

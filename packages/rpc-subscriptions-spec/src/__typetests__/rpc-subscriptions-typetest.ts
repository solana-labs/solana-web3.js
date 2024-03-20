import { createSubscriptionRpc, RpcSubscriptions } from '../rpc-subscriptions.js';
import { createRpcSubscriptionsApi, RpcSubscriptionsApiMethods } from '../rpc-subscriptions-api.js';
import { RpcSubscriptionsTransport } from '../rpc-subscriptions-transport.js';

interface MySubscriptionApiMethods extends RpcSubscriptionsApiMethods {
    bar(): string;
    foo(): number;
}

const api = createRpcSubscriptionsApi<MySubscriptionApiMethods>();
const transport = null as unknown as RpcSubscriptionsTransport;

createSubscriptionRpc({ api, transport }) satisfies RpcSubscriptions<MySubscriptionApiMethods>;

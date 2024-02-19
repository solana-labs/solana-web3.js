import { createSubscriptionRpc, RpcSubscriptions } from '../rpc-subscriptions';
import { createRpcSubscriptionsApi, RpcSubscriptionsApiMethods } from '../rpc-subscriptions-api';
import { RpcSubscriptionsTransport } from '../rpc-subscriptions-transport';

interface MySubscriptionApiMethods extends RpcSubscriptionsApiMethods {
    foo(): number;
    bar(): string;
}

const api = createRpcSubscriptionsApi<MySubscriptionApiMethods>();
const transport = null as unknown as RpcSubscriptionsTransport;

createSubscriptionRpc({ api, transport }) satisfies RpcSubscriptions<MySubscriptionApiMethods>;

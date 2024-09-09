import { createSubscriptionRpc, RpcSubscriptions } from '../rpc-subscriptions';
import { createRpcSubscriptionsApi } from '../rpc-subscriptions-api';
import { RpcSubscriptionsTransport } from '../rpc-subscriptions-transport';

type MySubscriptionApiMethods = {
    bar(): string;
    foo(): number;
};

const api = createRpcSubscriptionsApi<MySubscriptionApiMethods>();
const transport = null as unknown as RpcSubscriptionsTransport;

createSubscriptionRpc({ api, transport }) satisfies RpcSubscriptions<MySubscriptionApiMethods>;

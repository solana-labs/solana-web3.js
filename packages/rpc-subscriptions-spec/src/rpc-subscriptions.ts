import { SOLANA_ERROR__RPC_SUBSCRIPTIONS__CANNOT_CREATE_SUBSCRIPTION_PLAN, SolanaError } from '@solana/errors';
import { Callable, Flatten, OverloadImplementations, UnionToIntersection } from '@solana/rpc-spec-types';
import { createAsyncIterableFromDataPublisher } from '@solana/subscribable';

import { RpcSubscriptionsApi, RpcSubscriptionsPlan } from './rpc-subscriptions-api';
import { PendingRpcSubscriptionsRequest, RpcSubscribeOptions } from './rpc-subscriptions-request';
import { RpcSubscriptionsTransport } from './rpc-subscriptions-transport';

export type RpcSubscriptionsConfig<TRpcMethods> = Readonly<{
    api: RpcSubscriptionsApi<TRpcMethods>;
    transport: RpcSubscriptionsTransport;
}>;

export type RpcSubscriptions<TRpcSubscriptionsMethods> = {
    [TMethodName in keyof TRpcSubscriptionsMethods]: PendingRpcSubscriptionsRequestBuilder<
        OverloadImplementations<TRpcSubscriptionsMethods, TMethodName>
    >;
};

type PendingRpcSubscriptionsRequestBuilder<TSubscriptionMethodImplementations> = UnionToIntersection<
    Flatten<{
        [P in keyof TSubscriptionMethodImplementations]: PendingRpcSubscriptionsRequestReturnTypeMapper<
            TSubscriptionMethodImplementations[P]
        >;
    }>
>;

type PendingRpcSubscriptionsRequestReturnTypeMapper<TSubscriptionMethodImplementation> =
    // Check that this property of the TRpcSubscriptionMethods interface is, in fact, a function.
    TSubscriptionMethodImplementation extends Callable
        ? (
              ...args: Parameters<TSubscriptionMethodImplementation>
          ) => PendingRpcSubscriptionsRequest<ReturnType<TSubscriptionMethodImplementation>>
        : never;

export function createSubscriptionRpc<TRpcSubscriptionsApiMethods>(
    rpcConfig: RpcSubscriptionsConfig<TRpcSubscriptionsApiMethods>,
): RpcSubscriptions<TRpcSubscriptionsApiMethods> {
    return new Proxy(rpcConfig.api, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get(target, p, receiver) {
            return function (...rawParams: unknown[]) {
                const notificationName = p.toString();
                const createRpcSubscriptionPlan = Reflect.get(target, notificationName, receiver);
                if (!createRpcSubscriptionPlan) {
                    throw new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CANNOT_CREATE_SUBSCRIPTION_PLAN, {
                        notificationName,
                    });
                }
                const subscriptionPlan = createRpcSubscriptionPlan(...rawParams);
                return createPendingRpcSubscription(rpcConfig.transport, subscriptionPlan);
            };
        },
    }) as RpcSubscriptions<TRpcSubscriptionsApiMethods>;
}

function createPendingRpcSubscription<TNotification>(
    transport: RpcSubscriptionsTransport,
    subscriptionsPlan: RpcSubscriptionsPlan<TNotification>,
): PendingRpcSubscriptionsRequest<TNotification> {
    return {
        async subscribe({ abortSignal }: RpcSubscribeOptions): Promise<AsyncIterable<TNotification>> {
            const notificationsDataPublisher = await transport({
                signal: abortSignal,
                ...subscriptionsPlan,
            });
            return createAsyncIterableFromDataPublisher<TNotification>({
                abortSignal,
                dataChannelName: 'notification',
                dataPublisher: notificationsDataPublisher,
                errorChannelName: 'error',
            });
        },
    };
}

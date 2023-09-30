import { JsonRpcResponse } from './json-rpc';
import { SolanaJsonRpcError } from './json-rpc-errors';
import { createJsonRpcMessage } from './json-rpc-message';
import {
    PendingRpcSubscription,
    RpcSubscription,
    RpcSubscriptionConfig,
    RpcSubscriptions,
    SubscribeOptions,
} from './json-rpc-types';

type JsonRpcNotification<TNotification> = Readonly<{
    params: Readonly<{
        result: TNotification;
        subscription: number;
    }>;
}>;
type SubscriptionId = number;

function registerIterableCleanup(iterable: AsyncIterable<unknown>, cleanupFn: CallableFunction) {
    (async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _ of iterable);
        } catch {
            /* empty */
        } finally {
            // Run the cleanup function.
            cleanupFn();
        }
    })();
}

function createPendingRpcSubscription<TRpcSubscriptionMethods, TNotification>(
    rpcConfig: RpcSubscriptionConfig<TRpcSubscriptionMethods>,
    { params, subscribeMethodName, unsubscribeMethodName, responseProcessor }: RpcSubscription<TNotification>
): PendingRpcSubscription<TNotification> {
    return {
        async subscribe({ abortSignal }: SubscribeOptions): Promise<AsyncIterable<TNotification>> {
            abortSignal.throwIfAborted();
            let subscriptionId: number | undefined;
            function handleCleanup() {
                if (subscriptionId !== undefined) {
                    const payload = createJsonRpcMessage(unsubscribeMethodName, [subscriptionId]);
                    connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(payload).finally(() => {
                        connectionAbortController.abort();
                    });
                } else {
                    connectionAbortController.abort();
                }
            }
            abortSignal.addEventListener('abort', handleCleanup);
            /**
             * STEP 1: Send the subscribe message.
             */
            const connectionAbortController = new AbortController();
            const subscribeMessage = createJsonRpcMessage(subscribeMethodName, params);
            const connection = await rpcConfig.transport({
                payload: subscribeMessage,
                signal: connectionAbortController.signal,
            });
            function handleConnectionCleanup() {
                abortSignal.removeEventListener('abort', handleCleanup);
            }
            registerIterableCleanup(connection, handleConnectionCleanup);
            /**
             * STEP 2: Wait for the acknowledgement from the server with the subscription id.
             */
            for await (const message of connection as AsyncIterable<
                JsonRpcNotification<unknown> | JsonRpcResponse<SubscriptionId>
            >) {
                if ('id' in message && message.id === subscribeMessage.id) {
                    if ('error' in message) {
                        throw new SolanaJsonRpcError(message.error);
                    } else {
                        subscriptionId = message.result as SubscriptionId;
                        break;
                    }
                }
            }
            if (subscriptionId == null) {
                // TODO: Coded error.
                throw new Error('Failed to obtain a subscription id from the server');
            }
            /**
             * STEP 3: Return an iterable that yields notifications for this subscription id.
             */
            return {
                async *[Symbol.asyncIterator]() {
                    for await (const message of connection as AsyncIterable<
                        JsonRpcNotification<unknown> | JsonRpcResponse<SubscriptionId>
                    >) {
                        if (!('params' in message) || message.params.subscription !== subscriptionId) {
                            continue;
                        }
                        const notification = message.params.result as TNotification;
                        yield responseProcessor ? responseProcessor(notification) : notification;
                    }
                },
            };
        },
    };
}

function makeProxy<TRpcSubscriptionMethods>(
    rpcConfig: RpcSubscriptionConfig<TRpcSubscriptionMethods>
): RpcSubscriptions<TRpcSubscriptionMethods> {
    return new Proxy(rpcConfig.api, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get(target, p, receiver) {
            return function (...rawParams: unknown[]) {
                const methodName = p.toString();
                const createRpcSubscription = Reflect.get(target, methodName, receiver);
                if (p.toString().endsWith('Notifications') === false && !createRpcSubscription) {
                    // TODO: Coded error.
                    throw new Error(
                        "Either the notification name must end in 'Notifications' or the API " +
                            'must supply a subscription creator function to map between the ' +
                            'notification name and the subscribe/unsubscribe method names.'
                    );
                }
                const newRequest = createRpcSubscription
                    ? createRpcSubscription(...rawParams)
                    : {
                          params: rawParams,
                          subscribeMethodName: methodName.replace(/Notifications$/, 'Subscribe'),
                          unsubscribeMethodName: methodName.replace(/Notifications$/, 'Unsubscribe'),
                      };
                return createPendingRpcSubscription(rpcConfig, newRequest);
            };
        },
    }) as RpcSubscriptions<TRpcSubscriptionMethods>;
}

export function createJsonSubscriptionRpc<TRpcSubscriptionMethods>(
    rpcConfig: RpcSubscriptionConfig<TRpcSubscriptionMethods>
): RpcSubscriptions<TRpcSubscriptionMethods> {
    return makeProxy(rpcConfig);
}

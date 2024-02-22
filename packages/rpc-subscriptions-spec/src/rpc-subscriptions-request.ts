export type RpcSubscriptionsRequest<TResponse> = {
    params: unknown[];
    responseTransformer?: (response: unknown, notificationName: string) => TResponse;
    subscribeMethodName: string;
    unsubscribeMethodName: string;
};

export type PendingRpcSubscriptionsRequest<TNotification> = {
    subscribe(options: RpcSubscribeOptions): Promise<AsyncIterable<TNotification>>;
};

export type RpcSubscribeOptions = Readonly<{
    abortSignal: AbortSignal;
}>;

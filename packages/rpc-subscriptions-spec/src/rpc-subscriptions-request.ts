export type PendingRpcSubscriptionsRequest<TNotification> = {
    subscribe(options: RpcSubscribeOptions): Promise<AsyncIterable<TNotification>>;
};

export type RpcSubscribeOptions = Readonly<{
    abortSignal: AbortSignal;
}>;

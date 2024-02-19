type RpcSubscriptionsTransportConfig = Readonly<{
    payload: unknown;
    signal: AbortSignal;
}>;

export interface RpcSubscriptionsTransport {
    (config: RpcSubscriptionsTransportConfig): Promise<
        Readonly<
            AsyncIterable<unknown> & {
                send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: (payload: unknown) => Promise<void>;
            }
        >
    >;
}

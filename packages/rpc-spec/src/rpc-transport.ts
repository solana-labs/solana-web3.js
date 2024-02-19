type RpcTransportConfig = Readonly<{
    payload: unknown;
    signal?: AbortSignal;
}>;

export interface RpcTransport {
    <TResponse>(config: RpcTransportConfig): Promise<TResponse>;
}

export type RpcTransportRequest = {
    readonly payload: unknown;
    readonly signal?: AbortSignal;
    readonly toText?: (payload: unknown) => string;
};

export type RpcTransportResponse<TResponse = unknown> = {
    readonly json: () => Promise<TResponse>;
    readonly text: () => Promise<string>;
};

export type RpcTransport = {
    <TResponse>(request: RpcTransportRequest): Promise<RpcTransportResponse<TResponse>>;
};

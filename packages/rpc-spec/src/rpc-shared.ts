export type RpcRequest<TParams = unknown> = {
    readonly methodName: string;
    readonly params: TParams;
};

export type RpcResponse<TResponse = unknown> = TResponse;

export type RpcRequestTransformer = {
    <TParams>(request: RpcRequest<TParams>): RpcRequest;
};

export type RpcResponseTransformer<TResponse = unknown> = {
    (response: RpcResponse, request: RpcRequest): RpcResponse<TResponse>;
};

export type RpcRequest<TParams = unknown> = {
    readonly methodName: string;
    readonly params: TParams;
};

export type RpcRequestTransformer = {
    <TParams>(request: RpcRequest<TParams>): RpcRequest;
};

export type RpcRequest<TResponse> = {
    methodName: string;
    params: unknown[];
    responseTransformer?: (response: unknown, methodName: string) => TResponse;
};

export type PendingRpcRequest<TResponse> = {
    send(options?: RpcSendOptions): Promise<TResponse>;
};

export type RpcSendOptions = Readonly<{
    abortSignal?: AbortSignal;
}>;

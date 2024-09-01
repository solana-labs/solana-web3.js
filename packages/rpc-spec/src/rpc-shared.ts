export type RpcRequest<TParams = unknown> = {
    readonly methodName: string;
    readonly params: TParams;
};

export type RpcResponse<TResponse = unknown> = {
    readonly json: () => Promise<TResponse>;
    readonly text: () => Promise<string>;
};

export type RpcRequestTransformer = {
    <TParams>(request: RpcRequest<unknown>): RpcRequest<TParams>;
};

export type RpcResponseTransformer = {
    <TResponse>(response: RpcResponse<unknown>, request: RpcRequest<unknown>): RpcResponse<TResponse>;
};

export type RpcResponseTransformerFor<TResponse> = {
    (response: RpcResponse<unknown>, request: RpcRequest<unknown>): RpcResponse<TResponse>;
};

export function createJsonRpcResponseTransformer<TResponse>(
    jsonTransformer: (json: unknown, request: RpcRequest) => TResponse,
): RpcResponseTransformerFor<TResponse> {
    return function (response: RpcResponse, request: RpcRequest): RpcResponse<TResponse> {
        return Object.freeze({
            ...response,
            json: async () => {
                const json = await response.json();
                return jsonTransformer(json, request);
            },
        });
    };
}

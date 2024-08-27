export type RpcRequest<TParams = unknown> = {
    readonly methodName: string;
    readonly params: TParams;
};

export type RpcResponse<TResponse = unknown> = {
    readonly json: () => Promise<TResponse>;
    readonly text: () => Promise<string>;
};

export type RpcRequestTransformer = {
    <TParams>(request: RpcRequest<TParams>): RpcRequest;
};

export type RpcResponseTransformer<TResponse = unknown> = {
    (response: RpcResponse, request: RpcRequest): RpcResponse<TResponse>;
};

export function createJsonRpcResponseTransformer<TResponse = unknown>(
    jsonTransformer: (json: unknown, request: RpcRequest) => TResponse,
): RpcResponseTransformer<TResponse> {
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

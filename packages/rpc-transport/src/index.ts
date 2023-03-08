export interface IJsonRpcTransport {
    send<TParams, TResponse>(method: string, params: TParams): Promise<TResponse>;
}

export {};

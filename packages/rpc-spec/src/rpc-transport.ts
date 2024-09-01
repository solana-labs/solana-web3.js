import { RpcRequest, RpcResponse } from './rpc-shared';

export type RpcTransportRequest<TParams = unknown> = RpcRequest<TParams> & {
    readonly signal?: AbortSignal;
};

export type RpcTransport = {
    <TResponse>(request: RpcTransportRequest): Promise<RpcResponse<TResponse>>;
};

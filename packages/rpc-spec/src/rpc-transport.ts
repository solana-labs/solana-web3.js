import { RpcResponse } from './rpc-shared';

type RpcTransportRequest = Readonly<{
    payload: unknown;
    signal?: AbortSignal;
}>;

export type RpcTransport = {
    <TResponse>(request: RpcTransportRequest): Promise<RpcResponse<TResponse>>;
};

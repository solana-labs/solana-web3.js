import { RpcResponse } from './rpc-shared';

type RpcTransportRequest = Readonly<{
    payload: unknown;
    signal?: AbortSignal;
    toText?: (payload: unknown) => string;
}>;

export type RpcTransport = {
    <TResponse>(request: RpcTransportRequest): Promise<RpcResponse<TResponse>>;
};

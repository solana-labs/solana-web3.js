import { RpcResponse } from './rpc-shared';

type RpcTransportRequest = Readonly<{
    payload: unknown;
    signal?: AbortSignal;
}>;

export type RpcTransport = {
    <TResponse>(request: RpcTransportRequest): Promise<RpcResponse<TResponse>>;
};

export function isJsonRpcPayload(payload: unknown): payload is Readonly<{
    jsonrpc: '2.0';
    method: string;
    params: unknown;
}> {
    if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) {
        return false;
    }
    return (
        'jsonrpc' in payload &&
        payload.jsonrpc === '2.0' &&
        'method' in payload &&
        typeof payload.method === 'string' &&
        'params' in payload
    );
}

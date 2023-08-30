import { RpcWebSocketConnection } from './websocket/websocket-connection';

type RpcTransportConfig = Readonly<{
    payload: unknown;
    signal?: AbortSignal;
}>;

export interface IRpcTransport {
    <TResponse>(config: RpcTransportConfig): Promise<TResponse>;
}

type RpcWebSocketTransportConfig = Readonly<{
    signal: AbortSignal;
}>;

export interface IRpcWebSocketTransport {
    (config: RpcWebSocketTransportConfig): Promise<RpcWebSocketConnection>;
}

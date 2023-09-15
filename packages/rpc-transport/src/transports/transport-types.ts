import { RpcWebSocketConnection } from './websocket/websocket-connection';

type RpcTransportConfig = Readonly<{
    payload: unknown;
    signal?: AbortSignal;
}>;

export interface IRpcTransport {
    <TResponse>(config: RpcTransportConfig): Promise<TResponse>;
}

type RpcWebSocketTransportConfig = Readonly<{
    payload: unknown;
    signal: AbortSignal;
}>;

export interface IRpcWebSocketTransport {
    (config: RpcWebSocketTransportConfig): Promise<
        Readonly<
            Omit<RpcWebSocketConnection, 'send'> & {
                send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: RpcWebSocketConnection['send'];
            }
        >
    >;
}

import { IRpcWebSocketTransport } from '../transport-types';
import { createWebSocketConnection, RpcWebSocketConnection } from './websocket-connection';

type Config = Readonly<{
    url: string;
}>;

export function createWebSocketTransport({ url }: Config): IRpcWebSocketTransport {
    return async function ({ signal }: Parameters<IRpcWebSocketTransport>[0]) {
        signal.throwIfAborted();
        return (await createWebSocketConnection({ signal, url })) as RpcWebSocketConnection;
    };
}

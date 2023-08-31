import { IRpcWebSocketTransport } from '../transport-types';
import { createWebSocketConnection, RpcWebSocketConnection } from './websocket-connection';

type Config = Readonly<{
    sendBufferHighWatermark: number;
    url: string;
}>;

export function createWebSocketTransport({ sendBufferHighWatermark, url }: Config): IRpcWebSocketTransport {
    return async function ({ signal }: Parameters<IRpcWebSocketTransport>[0]) {
        signal.throwIfAborted();
        return (await createWebSocketConnection({
            sendBufferHighWatermark,
            signal,
            url,
        })) as RpcWebSocketConnection;
    };
}

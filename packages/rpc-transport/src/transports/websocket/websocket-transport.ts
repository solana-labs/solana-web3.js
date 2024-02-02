import { ClusterUrl } from '@solana/rpc-types';

import { IRpcWebSocketTransport, IRpcWebSocketTransportFromClusterUrl } from '../transport-types';
import { createWebSocketConnection } from './websocket-connection';

type Config<TClusterUrl extends ClusterUrl> = Readonly<{
    sendBufferHighWatermark: number;
    url: TClusterUrl;
}>;

export function createWebSocketTransport<TClusterUrl extends ClusterUrl>({
    sendBufferHighWatermark,
    url,
}: Config<TClusterUrl>): IRpcWebSocketTransportFromClusterUrl<TClusterUrl> {
    if (/^wss?:/i.test(url) === false) {
        const protocolMatch = url.match(/^([^:]+):/);
        throw new DOMException(
            protocolMatch
                ? `Failed to construct 'WebSocket': The URL's scheme must be either 'ws' or 'wss'. '${protocolMatch[1]}:' is not allowed.`
                : `Failed to construct 'WebSocket': The URL '${url}' is invalid.`,
        );
    }
    return async function sendWebSocketMessage({ payload, signal }: Parameters<IRpcWebSocketTransport>[0]) {
        signal?.throwIfAborted();
        const connection = await createWebSocketConnection({
            sendBufferHighWatermark,
            signal,
            url,
        });
        signal?.throwIfAborted();
        await connection.send(payload);
        return {
            [Symbol.asyncIterator]: connection[Symbol.asyncIterator].bind(connection),
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: connection.send.bind(connection),
        };
    } as IRpcWebSocketTransportFromClusterUrl<TClusterUrl>;
}

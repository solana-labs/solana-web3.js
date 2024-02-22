import { RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';

import { createWebSocketConnection } from './websocket-connection';

type Config = Readonly<{
    sendBufferHighWatermark: number;
    url: string;
}>;

export function createWebSocketTransport({ sendBufferHighWatermark, url }: Config): RpcSubscriptionsTransport {
    if (/^wss?:/i.test(url) === false) {
        const protocolMatch = url.match(/^([^:]+):/);
        throw new DOMException(
            protocolMatch
                ? `Failed to construct 'WebSocket': The URL's scheme must be either 'ws' or 'wss'. '${protocolMatch[1]}:' is not allowed.`
                : `Failed to construct 'WebSocket': The URL '${url}' is invalid.`,
        );
    }
    return async function sendWebSocketMessage({ payload, signal }: Parameters<RpcSubscriptionsTransport>[0]) {
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
    };
}

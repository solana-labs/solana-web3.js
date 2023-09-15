import { createWebSocketTransport } from '@solana/rpc-transport';
import { IRpcWebSocketTransport } from '@solana/rpc-transport/dist/types/transports/transport-types';

export function createDefaultRpcSubscriptionsTransport(
    config: Omit<Parameters<typeof createWebSocketTransport>[0], 'sendBufferHighWatermark'> & {
        sendBufferHighWatermark?: number;
    }
): IRpcWebSocketTransport {
    return createWebSocketTransport({
        ...config,
        sendBufferHighWatermark:
            config.sendBufferHighWatermark ??
            // Let 128KB of data into the WebSocket buffer before buffering it in the app.
            131_072,
    });
}

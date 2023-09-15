import { createWebSocketTransport } from '@solana/rpc-transport';
import { IRpcWebSocketTransport } from '@solana/rpc-transport/dist/types/transports/transport-types';

import { getWebSocketTransportWithAutoping } from './rpc-websocket-autopinger';

export function createDefaultRpcSubscriptionsTransport(
    config: Omit<Parameters<typeof createWebSocketTransport>[0], 'sendBufferHighWatermark'> & {
        intervalMs?: number;
        sendBufferHighWatermark?: number;
    }
): IRpcWebSocketTransport {
    const { intervalMs, ...rest } = config;
    return getWebSocketTransportWithAutoping({
        intervalMs: intervalMs ?? 5_000,
        transport: createWebSocketTransport({
            ...rest,
            sendBufferHighWatermark:
                config.sendBufferHighWatermark ??
                // Let 128KB of data into the WebSocket buffer before buffering it in the app.
                131_072,
        }),
    });
}

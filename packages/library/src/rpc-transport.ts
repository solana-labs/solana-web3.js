import { pipe } from '@solana/functional';
import { createHttpTransport } from '@solana/rpc-transport';
import { IRpcTransport } from '@solana/rpc-transport/dist/types/transports/transport-types';

import { getRpcTransportWithRequestCoalescing } from './rpc-request-coalescer';
import { getSolanaRpcPayloadDeduplicationKey } from './rpc-request-deduplication';

/**
 * Lowercasing header names makes it easier to override user-supplied headers.
 */
function normalizeHeaders<T extends Record<string, string>>(
    headers: T
): { [K in keyof T & string as Lowercase<K>]: T[K] } {
    const out: Record<string, string> = {};
    for (const headerName in headers) {
        out[headerName.toLowerCase()] = headers[headerName];
    }
    return out as { [K in keyof T & string as Lowercase<K>]: T[K] };
}

export function createDefaultRpcTransport(config: Parameters<typeof createHttpTransport>[0]): IRpcTransport {
    return pipe(
        createHttpTransport({
            ...config,
            headers: {
                ...(config.headers ? normalizeHeaders(config.headers) : undefined),
                ...({
                    // Keep these headers lowercase so they will override any user-supplied headers above.
                    'solana-client': `js/${__VERSION__}` ?? 'UNKNOWN',
                } as { [overrideHeader: string]: string }),
            },
        }),
        transport => getRpcTransportWithRequestCoalescing(transport, getSolanaRpcPayloadDeduplicationKey)
    );
}

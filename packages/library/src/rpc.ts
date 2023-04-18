import { SolanaRpcMethods, createSolanaRpcApi } from '@solana/rpc-core';
import { DEFAULT_RPC_CONFIG } from './rpc-default-config';

import { createJsonRpcTransport } from '@solana/rpc-transport';
import type {
    Transport,
    TransportConfig,
} from '@solana/rpc-transport/dist/types/json-rpc-transport/json-rpc-transport-types';

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

export function createDefaultRpc(config: Omit<TransportConfig<SolanaRpcMethods>, 'api'>): Transport<SolanaRpcMethods> {
    return createJsonRpcTransport({
        ...config,
        api: createSolanaRpcApi(DEFAULT_RPC_CONFIG),
        headers: {
            ...(config.headers ? normalizeHeaders(config.headers) : undefined),
            ...({
                'solana-client': `js/${__VERSION__}` ?? 'UNKNOWN',
            } as { [overrideHeader: string]: string }),
        },
    });
}
